#!/bin/sh
# Mundo do cenario Boi na Nuvem. Cada servidor e um network namespace ligado
# ao notebook da pentester por um par veth. O notebook fala pela "VPN da
# consultoria" (10.8.0.2). Enderecos sao faixas de documentacao (RFC 5737).
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

# No escopo: rede externa do cliente, 203.0.113.0/28
servidor www       203.0.113.10
servidor pedidos   203.0.113.12
# Fora do escopo: a hospedagem do site e o concorrente do Seu Dirceu
servidor hostbacana 198.51.100.20
servidor paraiso    198.51.100.77

chmod 700 /srv /etc/escopo /var/log

# SSH do servidor do site (o acesso fica para um ato seguinte)
mkdir -p /run/sshd
ip netns exec www /usr/sbin/sshd -f /etc/escopo/sshd_www.conf

# Todos os servidores web num processo so (setns por socket)
python3 -B /usr/local/sbin/ef-mundo /etc/escopo/servicos.json &
# espera os sockets subirem
i=0
while [ $i -lt 100 ] && [ ! -e /run/ef-mundo.pronto ]; do sleep 0.2; i=$((i+1)); done
