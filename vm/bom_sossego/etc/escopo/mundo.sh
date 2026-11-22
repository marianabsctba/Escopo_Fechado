#!/bin/sh
# Mundo do cenário São Jerônimo do Bom Sossego: rede interna da prefeitura.
# Teste interno: a pentester entra na rede pela VPN com uma conta de
# servidor comum fornecida no contrato.
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

# No escopo: rede administrativa 10.20.0.0/24
servidor dc01 10.20.0.10
servidor fs01 10.20.0.20
# Fora do escopo: Câmara Municipal (outro Poder) e o fornecedor da folha
servidor camara 10.20.1.5
servidor folhacerta 198.51.100.120

chmod 700 /etc/escopo /var/log

FASE=$(sed -n 's/.*escopo\.fase=\([a-z]*\).*/\1/p' /proc/cmdline)
FASE="${FASE:-teste}"

# Reteste: as "correções" do secretário de TI
if [ "$FASE" = "reteste" ]; then
  cp /srv/dc01/reteste/logon.bat /srv/dc01/netlogon/logon.bat
  cp /srv/dc01/reteste/logon.bat.bak /srv/dc01/netlogon/logon.bat.bak
  mkdir -p /srv/fs01/publico/arquivo_morto
  mv /srv/fs01/publico/folha_pagamento_2026-10.csv /srv/fs01/publico/arquivo_morto/
fi

# Contas: a de teste do contrato e as que os compartilhamentos usam
addgroup -S prefeitura >/dev/null 2>&1
for u in servidor.teste adm.financas clodoaldo.ti; do
  adduser -D -H -s /sbin/nologin "$u" >/dev/null 2>&1
  addgroup "$u" prefeitura >/dev/null 2>&1
done
# O Samba lê os arquivos como o usuário logado. Só as contas da prefeitura
# atravessam as pastas; a usuária do notebook (pentester) não.
chmod 711 /srv
for d in /srv/dc01 /srv/fs01; do
  chown -R root:prefeitura "$d"
  find "$d" -type d -exec chmod 750 {} +
  find "$d" -type f -exec chmod 640 {} +
done
chown -R adm.financas /srv/fs01/financas
chown -R clodoaldo.ti /srv/fs01/rh
chmod 700 /srv/fs01/financas /srv/fs01/rh /srv/dc01/reteste
SENHA_TESTE='Teste@Contrato1'

# Diretório (OpenLDAP no formato do AD)
CONF=/etc/escopo/ldap/slapd.conf
[ "$FASE" = "reteste" ] && CONF=/etc/escopo/ldap/slapd-reteste.conf
LDIF=/etc/escopo/ldap/dados.ldif
[ "$FASE" = "reteste" ] && LDIF=/etc/escopo/ldap/dados-reteste.ldif
mkdir -p /run/escopo-ldap
slapadd -q -f "$CONF" -l "$LDIF"
ip netns exec dc01 slapd -f "$CONF" -h "ldap://10.20.0.10/"

# Compartilhamentos (Samba de verdade, um processo por servidor)
for h in dc01 fs01; do
  CONF_SMB=/etc/escopo/smb-$h.conf
  [ "$FASE" = "reteste" ] && [ -f /etc/escopo/smb-$h-reteste.conf ] && CONF_SMB=/etc/escopo/smb-$h-reteste.conf
  mkdir -p /run/samba-$h/lock /run/samba-$h/state /run/samba-$h/cache /run/samba-$h/private /run/samba-$h/ncalrpc /var/run/samba
  printf '%s\n%s\n' "$SENHA_TESTE" "$SENHA_TESTE" | smbpasswd -c "$CONF_SMB" -a -s servidor.teste >> /var/log/smbd-start.log 2>&1 || echo 'EF:ERRO smbpasswd falhou' > /dev/ttyS1
  printf 'x9!Fin4ncas\nx9!Fin4ncas\n' | smbpasswd -c "$CONF_SMB" -a -s adm.financas >/dev/null
  printf 'x9!Cl0doaldo\nx9!Cl0doaldo\n' | smbpasswd -c "$CONF_SMB" -a -s clodoaldo.ti >/dev/null
  ip netns exec "$h" smbd -D -s "$CONF_SMB" >> /var/log/smbd-start.log 2>&1
done
# Espera o Samba escutar; se não subir, manda o log para o jogo (diagnóstico)
i=0
while [ $i -lt 50 ] && ! ip netns exec fs01 sh -c 'cat /proc/net/tcp' | grep -q ':01BD '; do sleep 0.2; i=$((i+1)); done
if ! ip netns exec fs01 sh -c 'cat /proc/net/tcp' | grep -q ':01BD '; then
  cat /var/log/smbd-start.log /var/log/samba-fs01.log 2>/dev/null | tail -n 15 | while IFS= read -r l; do printf 'EF:ERRO %s\n' "$l" > /dev/ttyS1; done
fi

# Web dos vizinhos fora do escopo (para acusar acesso indevido)
python3 -B /usr/local/sbin/ef-mundo /etc/escopo/servicos.json &
i=0
while [ $i -lt 100 ] && [ ! -e /run/ef-mundo.pronto ]; do sleep 0.2; i=$((i+1)); done
