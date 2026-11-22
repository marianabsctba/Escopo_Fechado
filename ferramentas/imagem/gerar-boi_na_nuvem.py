#!/usr/bin/env python3
"""Gera os artefatos do mundo Boi na Nuvem dentro do rootfs da VM.

- histórico git do site (com a senha que o Jefferson "tirou" do repositório)
- planilha de clientes esquecida no backup (dados fictícios, CPFs inválidos)
- foto da festa da Dona Neide com metadados PNG
- chaves do SSH do servidor

Uso: gerar-boi_na_nuvem.py <rootfs>
"""
import os
import random
import shutil
import struct
import subprocess
import sys
import tempfile
import zlib

ROOT = sys.argv[1]
WWW = os.path.join(ROOT, "srv/www/html")
JEFF = ("Jefferson", "jefferson@boinanuvem.exemplo")


def git(repo, *args, data=None):
    env = dict(os.environ)
    env.update({
        "GIT_AUTHOR_NAME": JEFF[0], "GIT_AUTHOR_EMAIL": JEFF[1],
        "GIT_COMMITTER_NAME": JEFF[0], "GIT_COMMITTER_EMAIL": JEFF[1],
        "GIT_CONFIG_GLOBAL": "/dev/null", "GIT_CONFIG_SYSTEM": "/dev/null",
    })
    if data:
        env["GIT_AUTHOR_DATE"] = env["GIT_COMMITTER_DATE"] = data
    subprocess.run(["git", "-C", repo, *args], check=True, env=env, stdout=subprocess.DEVNULL)


def commit(repo, msg, data):
    git(repo, "add", "-A")
    git(repo, "commit", "-q", "-m", msg, data=data)


CONFIG_PHP = """<?php
// conexao com o banco do sistema de pedidos
$db_host = 'pedidos.boinanuvem.exemplo';
$db_nome = 'pedidos';
$db_user = 'boi_admin';
$db_pass = 'Picanha@2021!';
"""


def historico_git():
    tmp = tempfile.mkdtemp()
    repo = os.path.join(tmp, "site")
    os.makedirs(os.path.join(repo, "img"))
    git(repo, "init", "-q", "-b", "main")
    for f in ("index.html", "equipe.html", "estilo.css"):
        shutil.copy(os.path.join(WWW, f), repo)
    shutil.copy(os.path.join(WWW, "img/festa-neide.png"), os.path.join(repo, "img"))
    commit(repo, "site novo top", "2021-03-12T23:41:00-03:00")

    with open(os.path.join(repo, "config.php"), "w") as f:
        f.write(CONFIG_PHP)
    commit(repo, "conectando no sistema de pedidos", "2021-03-13T01:12:00-03:00")

    os.remove(os.path.join(repo, "config.php"))
    with open(os.path.join(repo, ".gitignore"), "w") as f:
        f.write("config.php\nbackup-antigo/\n")
    commit(repo, "tirei a senha do repo, agr ta seguro kkkk", "2021-03-13T01:20:00-03:00")

    shutil.copy(os.path.join(WWW, "robots.txt"), repo)
    commit(repo, "robots pro google", "2021-06-02T22:05:00-03:00")

    destino = os.path.join(WWW, ".git")
    shutil.rmtree(destino, ignore_errors=True)
    shutil.copytree(os.path.join(repo, ".git"), destino)
    # sem hooks de exemplo: so poluem a listagem
    shutil.rmtree(os.path.join(destino, "hooks"), ignore_errors=True)
    shutil.copy(os.path.join(repo, ".gitignore"), WWW)
    shutil.rmtree(tmp)


NOMES = "Ana Antônio Aparecida Benedito Bruna Carlos Cláudia Cleiton Daiane Divino Edna Elias Fabiana Geraldo Gisele Hélio Ivone Joaquim Josefa Juliana Kátia Lázaro Lúcia Marcos Maria Nilton Odete Paulo Raimunda Reginaldo Rosângela Sebastião Sônia Tereza Valdir Vanessa Waldemar Zilda".split()
SOBRENOMES = "Silva Souza Oliveira Pereira Costa Rodrigues Almeida Nascimento Lima Araújo Fernandes Carvalho Gomes Martins Rocha Ribeiro Alves Monteiro Mendes Barros Freitas Barbosa Pinto Moura Cavalcanti Dias Castro Campos Cardoso Teixeira".split()
CIDADES = ["Goiânia", "Anápolis", "Rio Verde", "Jataí", "Catalão", "Itumbiara", "Trindade", "Formosa", "Mineiros", "Inhumas"]


def cpf_invalido(rnd):
    """CPF no formato certo, com dígitos verificadores errados de propósito."""
    base = [rnd.randint(0, 9) for _ in range(9)]
    s = sum(d * (10 - i) for i, d in enumerate(base))
    d1 = (s * 10 % 11) % 10
    s = sum(d * (11 - i) for i, d in enumerate(base + [d1]))
    d2 = (s * 10 % 11) % 10
    d2 = (d2 + 1 + rnd.randint(0, 8)) % 10  # garante que não bate
    n = base + [d1, d2]
    return "{}{}{}.{}{}{}.{}{}{}-{}{}".format(*n)


def planilha():
    rnd = random.Random(1994)
    pasta = os.path.join(WWW, "backup-antigo")
    os.makedirs(pasta, exist_ok=True)
    with open(os.path.join(pasta, "clientes_export_2021.csv"), "w", encoding="utf-8") as f:
        f.write("nome;cpf;telefone;cidade;ultima_compra_kg\n")
        for _ in range(1284):
            nome = f"{rnd.choice(NOMES)} {rnd.choice(SOBRENOMES)} {rnd.choice(SOBRENOMES)}"
            tel = f"(62) 90000-{rnd.randint(0, 9999):04d}"
            f.write(f"{nome};{cpf_invalido(rnd)};{tel};{rnd.choice(CIDADES)};{rnd.randint(20, 900)}\n")
    with open(os.path.join(pasta, "LEIA-ME.txt"), "w", encoding="utf-8") as f:
        f.write("backup do sistema velho antes da migracao. NAO APAGAR (Jefferson, 2021)\n")


def chunk(tipo, dados):
    c = tipo + dados
    return struct.pack(">I", len(dados)) + c + struct.pack(">I", zlib.crc32(c) & 0xFFFFFFFF)


def foto():
    """Desenho simples (bolo, post-it no monitor) com metadados PNG tEXt."""
    w, h = 240, 160
    px = []
    for y in range(h):
        linha = bytearray([0])
        for x in range(w):
            cor = (250, 235, 215)                      # parede
            if 60 <= x <= 180 and 20 <= y <= 95:
                cor = (40, 40, 48)                     # monitor
            if 150 <= x <= 176 and 24 <= y <= 46:
                cor = (255, 230, 90)                   # post-it
            if 85 <= x <= 155 and 110 <= y <= 150:
                cor = (255, 140, 180)                  # bolo
            if 118 <= x <= 122 and 96 <= y <= 110:
                cor = (255, 200, 60)                   # vela
            linha += bytes(cor)
        px.append(bytes(linha))
    meta = {
        b"Title": "Festa 30 anos de casa da Neide",
        b"Author": "Jefferson",
        b"Software": "Celular do Jefferson",
        b"Description": "Parabens Dona Neide!! detalhe pro post-it no monitor kkkk: usuario neide / senha Boi@1994 (sistema de pedidos)",
    }
    png = b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", struct.pack(">IIBBBBB", w, h, 8, 2, 0, 0, 0))
    for k, v in meta.items():
        png += chunk(b"tEXt", k + b"\x00" + v.encode("latin-1"))
    png += chunk(b"IDAT", zlib.compress(b"".join(px), 9)) + chunk(b"IEND", b"")
    os.makedirs(os.path.join(WWW, "img"), exist_ok=True)
    with open(os.path.join(WWW, "img/festa-neide.png"), "wb") as f:
        f.write(png)
    # Reteste: a mesma foto, republicada sem metadados (essa o Jefferson acertou)
    limpa = b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", struct.pack(">IIBBBBB", w, h, 8, 2, 0, 0, 0))
    limpa += chunk(b"IDAT", zlib.compress(b"".join(px), 9)) + chunk(b"IEND", b"")
    reteste = os.path.join(ROOT, "srv/www/reteste")
    os.makedirs(reteste, exist_ok=True)
    with open(os.path.join(reteste, "festa-neide.png"), "wb") as f:
        f.write(limpa)


def chaves_ssh():
    pasta = os.path.join(ROOT, "etc/escopo/ssh")
    os.makedirs(pasta, exist_ok=True)
    for tipo, extra in (("ed25519", []), ("rsa", ["-b", "2048"])):
        arq = os.path.join(pasta, f"ssh_host_{tipo}_key")
        if os.path.exists(arq):
            os.remove(arq)
            os.remove(arq + ".pub")
        subprocess.run(["ssh-keygen", "-q", "-N", "", "-t", tipo, *extra, "-C", "www", "-f", arq], check=True)
        os.chmod(arq, 0o600)


foto()
planilha()
historico_git()
chaves_ssh()
open(os.path.join(ROOT, "etc/escopo/mundo.ativo"), "w").close()
print("mundo Boi na Nuvem gerado")
