#!/bin/sh
# Mundo do cenário Pinhão Forte. Mesma ideia do Boi na Nuvem: cada servidor
# é um network namespace ligado ao notebook por um par veth.
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

# No escopo: 192.0.2.32/28
servidor www      192.0.2.34
servidor app      192.0.2.36
servidor homolog  192.0.2.40
# Fora do escopo: a fábrica de software e a cooperativa vizinha
servidor coderapido 198.51.100.40
servidor araucaria  198.51.100.90

chmod 700 /srv /etc/escopo /var/log

# Fase do mundo: "reteste" sobe as correções da fábrica de software
FASE=$(sed -n 's/.*escopo\.fase=\([a-z]*\).*/\1/p' /proc/cmdline)
export EF_FASE="${FASE:-teste}"
SERVICOS=/etc/escopo/servicos.json
[ "$EF_FASE" = "reteste" ] && SERVICOS=/etc/escopo/servicos-reteste.json
python3 -B /usr/local/sbin/ef-mundo "$SERVICOS" &
i=0
while [ $i -lt 100 ] && [ ! -e /run/ef-mundo.pronto ]; do sleep 0.2; i=$((i+1)); done
