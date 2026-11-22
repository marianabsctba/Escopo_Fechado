#!/bin/sh
# Mundo do cenário Pé de Moleque: a bilheteria do clube foi comprometida
# antes do teste. O servidor roda com hostname, processos e sistema de
# arquivos próprios (namespaces de UTS, PID e mount + chroot do SSH).
set -u
VPN=10.8.0.2
ip addr add "$VPN/32" dev lo

servidor() {
  nome=$1; ip=$2
  ip netns add "$nome"
  ip link add "v-$nome" type veth peer name eth0 netns "$nome"
  ip link set "v-$nome" up
  ip route add "$ip/32" dev "v-$nome" src "$VPN"
  ip netns exec "$nome" ip link set lo up
  ip netns exec "$nome" ip addr add "$ip/32" dev eth0
  ip netns exec "$nome" ip link set eth0 up
  ip netns exec "$nome" ip route add "$VPN/32" dev eth0
  ip netns exec "$nome" ip route add default via "$VPN" dev eth0 onlink
}

servidor site       10.30.0.10
servidor bilheteria 10.30.0.15
# Fora do escopo: o servidor do invasor. Não se revida.
servidor invasor    198.51.100.66
# a bilheteria alcança o invasor (é por aí que a conexão suspeita sai)
ip route add 198.51.100.66/32 dev v-invasor src "$VPN" 2>/dev/null
ip netns exec bilheteria ip route replace 198.51.100.66/32 via "$VPN" dev eth0 onlink
echo 1 > /proc/sys/net/ipv4/ip_forward

chmod 700 /etc/escopo /var/log
chmod 711 /srv

FASE=$(sed -n 's/.*escopo\.fase=\([a-z]*\).*/\1/p' /proc/cmdline)
FASE="${FASE:-teste}"
R=/srv/bilheteria

# Pós-erradicação: o clube "limpou" o servidor (e esqueceu uma coisa)
if [ "$FASE" = "reteste" ]; then
  rm -rf "$R/tmp/.x"
  rm -f "$R/etc/crontabs/admin"
  grep -v 'x@vps' "$R/home/admin/.ssh/authorized_keys" > /tmp/ak && cat /tmp/ak > "$R/home/admin/.ssh/authorized_keys"
  cat /etc/escopo/reteste/auth.log.extra >> "$R/var/log/auth.log"
fi

# Conta do auditor (a do contrato). Entra só por chave e cai no chroot.
adduser -D -u 2001 -h /home/auditor -s /bin/bash auditor >/dev/null 2>&1
addgroup auditor adm >/dev/null 2>&1
sed -i 's/^auditor:!:/auditor:*:/' /etc/shadow

# O chroot usa os programas do notebook, só leitura
for d in bin sbin usr lib; do
  mount --bind "/$d" "$R/$d"
  mount -o remount,ro,bind "$R/$d"
done
mount --bind /dev "$R/dev"
mkdir -p /run/sshd /var/empty

ip netns exec bilheteria unshare --uts --pid --mount --fork sh -c "
  hostname bilheteria
  mount -t proc proc $R/proc
  if [ '$FASE' != 'reteste' ]; then
    chroot $R su-exec 2002:2002 /bin/sh /tmp/.x/kworkerd >/dev/null 2>&1 &
  fi
  exec /usr/sbin/sshd -D -f /etc/escopo/sshd_bilheteria.conf
" &

python3 -B /usr/local/sbin/ef-mundo /etc/escopo/servicos.json &
i=0
while [ $i -lt 100 ] && [ ! -e /run/ef-mundo.pronto ]; do sleep 0.2; i=$((i+1)); done
