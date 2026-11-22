#!/usr/bin/env python3
"""Gera os artefatos do mundo Pinhão Forte dentro do rootfs da VM.

- certificados TLS (ECDSA P-256, autoassinados) de cada servidor; o do site
  lista nos nomes alternativos (SAN) o endereço da homologação, que não está
  no DNS público: é assim que a pentester descobre que ela existe.

Uso: gerar-pinhao_forte.py <rootfs>
"""
import os
import subprocess
import sys

ROOT = sys.argv[1]
TLS = os.path.join(ROOT, "etc/escopo/tls")

CERTS = {
    "www": ("Cooperativa de Credito Pinhao Forte", ["www.pinhaoforte.exemplo", "pinhaoforte.exemplo", "app.pinhaoforte.exemplo", "homolog-app.pinhaoforte.exemplo"]),
    "app": ("Cooperativa de Credito Pinhao Forte", ["app.pinhaoforte.exemplo"]),
    "homolog": ("CodeRapido Sistemas", ["homolog-app.pinhaoforte.exemplo"]),
    "coderapido": ("CodeRapido Sistemas", ["git.coderapido.exemplo", "coderapido.exemplo"]),
    "araucaria": ("Cooperativa Araucaria", ["www.araucaria.exemplo", "araucaria.exemplo"]),
}


def certificado(nome, org, sans):
    chave = os.path.join(TLS, f"{nome}.key")
    cert = os.path.join(TLS, f"{nome}.crt")
    san = ",".join(f"DNS:{s}" for s in sans)
    subprocess.run(
        [
            "openssl", "req", "-x509", "-newkey", "ec", "-pkeyopt", "ec_paramgen_curve:prime256v1",
            "-nodes", "-days", "3650", "-keyout", chave, "-out", cert,
            "-subj", f"/C=BR/ST=Parana/O={org}/CN={sans[0]}",
            "-addext", f"subjectAltName={san}",
        ],
        check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
    )
    os.chmod(chave, 0o600)


os.makedirs(TLS, exist_ok=True)
for nome, (org, sans) in CERTS.items():
    certificado(nome, org, sans)
open(os.path.join(ROOT, "etc/escopo/mundo.ativo"), "w").close()
print("mundo Pinhão Forte gerado")
