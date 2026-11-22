#!/usr/bin/env python3
"""Gera os artefatos do mundo São Jerônimo do Bom Sossego no rootfs da VM.

- diretório no formato do AD (LDIF de teste e de reteste)
- planilha da folha de pagamento esquecida na pasta pública (fictícia, CPFs
  inválidos de propósito)
- certificado do fornecedor da folha (fora do escopo)

Uso: gerar-bom_sossego.py <rootfs>
"""
import base64
import hashlib
import os
import random
import subprocess
import sys

ROOT = sys.argv[1]
BASE = "dc=bomsossego,dc=exemplo"
LDAP = os.path.join(ROOT, "etc/escopo/ldap")

# (login, nome, cargo, uac, pwdLastSet, lastLogon, descrição, admin do domínio)
CONTAS = [
    ("clodoaldo.ti", "Clodoaldo Batista", "Secretario de TI", 66048, "2011-03-02", "2026-11-21", "Secretario de TI (primo do vice)", True),
    ("prefeito.juvenal", "Juvenal Sossego", "Prefeito", 66048, "2013-01-02", "2026-10-30", "Gabinete do Prefeito", True),
    ("vicentinho.ti", "Vicente Batista Filho", "Assessor de TI", 66048, "2017-05-10", "2026-11-19", "Assessor (sobrinho do vice)", True),
    ("adm.financas", "Conta de servico Financas", "Conta de servico", 66048, "2019-08-14", "2026-11-22", "Mapeamento da pasta Financas", True),
    ("estagiario.ti", "Estagiario TI", "Estagiario", 512, "2024-02-05", "2026-11-18", "Estagiario TI - senha provisoria: Sossego@2024 (trocar no 1o acesso)", True),
    ("suporte.terceirizado", "Suporte Terceirizado", "Fornecedor", 66048, "2015-09-01", "2021-04-12", "Empresa de suporte (contrato encerrado em 2021)", True),
    ("servidor.teste", "Servidor Teste", "Conta do pentest", 512, "2026-11-20", "2026-11-22", "Conta de teste do contrato de pentest", False),
    ("maria.aparecida", "Maria Aparecida Lins", "Assistente Administrativa", 512, "2026-06-01", "2026-11-21", "Protocolo", False),
    ("joao.batista", "Joao Batista Neto", "Motorista", 512, "2025-11-12", "2026-11-20", "Garagem", False),
    ("dona.cicera", "Cicera Gomes", "Tesoureira", 512, "2026-02-10", "2026-11-22", "Tesouraria", False),
    ("seu.damiao", "Damiao Ferreira", "Almoxarife", 512, "2018-07-07", "2026-11-14", "Almoxarifado", False),
    ("professora.lucia", "Lucia Rocha", "Professora", 512, "2026-03-15", "2026-11-21", "Secretaria de Educacao", False),
    ("enf.rosangela", "Rosangela Pires", "Enfermeira", 512, "2026-08-20", "2026-11-22", "UBS Centro", False),
    ("dr.wellington", "Wellington Sales", "Procurador", 512, "2026-04-04", "2026-11-21", "Procuradoria", False),
    ("iracema.proc", "Iracema Vasconcelos", "Procuradora-geral", 512, "2026-09-01", "2026-11-22", "Procuradoria-geral e encarregada de dados", False),
    ("ze.do.arquivo", "Jose Arquimedes", "Arquivista", 514, "2020-01-10", "2020-12-18", "Aposentado em 2020", False),
    ("ex.secretario", "Ronaldo Pimenta", "Ex-secretario de Obras", 512, "2016-02-02", "2020-12-30", "Saiu na troca de gestao de 2021", False),
    ("cozinha.merenda", "Cozinha Merenda", "Conta compartilhada", 66048, "2012-05-05", "2026-11-22", "Conta da cozinha (todo mundo usa)", False),
    ("recepcao", "Recepcao Prefeitura", "Conta compartilhada", 66048, "2010-10-10", "2026-11-22", "Computador da recepcao", False),
    ("fiscal.tributos", "Antonia Brito", "Fiscal de Tributos", 512, "2026-07-07", "2026-11-19", "Tributos", False),
    ("obras.engenheiro", "Paulo Sergio Melo", "Engenheiro", 512, "2026-05-19", "2026-11-17", "Secretaria de Obras", False),
    ("assistencia.social", "Fatima Alencar", "Assistente Social", 512, "2026-01-30", "2026-11-21", "CRAS", False),
]

SENHA_TESTE = "Teste@Contrato1"


def ssha(senha):
    sal = os.urandom(4)
    h = hashlib.sha1(senha.encode() + sal).digest()
    return "{SSHA}" + base64.b64encode(h + sal).decode()


def ldif(reteste=False):
    linhas = [
        f"dn: {BASE}", "objectClass: dcObject", "objectClass: organization", "objectClass: domainDNS",
        "dc: bomsossego", "o: Prefeitura Municipal de Sao Jeronimo do Bom Sossego",
        "minPwdLength: 6", "lockoutThreshold: 0", "maxPwdAge: nunca", "",
        f"dn: ou=Usuarios,{BASE}", "objectClass: organizationalUnit", "ou: Usuarios", "",
        f"dn: ou=Grupos,{BASE}", "objectClass: organizationalUnit", "ou: Grupos", "",
    ]
    admins = []
    for login, nome, cargo, uac, pwd, logon, desc, admin in CONTAS:
        dn = f"cn={nome},ou=Usuarios,{BASE}"
        if reteste and login == "estagiario.ti":
            desc, pwd = "Estagiario TI", "2026-11-21"
        linhas += [
            f"dn: {dn}", "objectClass: user", f"cn: {nome}", f"sn: {nome.split()[-1]}",
            f"sAMAccountName: {login}", f"title: {cargo}", f"description: {desc}",
            f"userAccountControl: {uac}", f"pwdLastSet: {pwd}", f"lastLogonTimestamp: {logon}",
            f"whenCreated: {pwd if pwd < '2015' else '2015-01-01'}",
        ]
        if admin:
            linhas.append(f"memberOf: cn=Domain Admins,ou=Grupos,{BASE}")
            admins.append(dn)
        linhas.append(f"memberOf: cn=Servidores,ou=Grupos,{BASE}")
        if login == "servidor.teste":
            linhas.append(f"userPassword: {ssha(SENHA_TESTE)}")
        linhas.append("")
    linhas += [f"dn: cn=Domain Admins,ou=Grupos,{BASE}", "objectClass: group", "cn: Domain Admins",
               "sAMAccountName: Domain Admins", "description: Administradores do dominio"]
    linhas += [f"member: {d}" for d in admins] + [""]
    linhas += [f"dn: cn=Servidores,ou=Grupos,{BASE}", "objectClass: group", "cn: Servidores",
               "sAMAccountName: Servidores", "description: Todos os servidores", ""]
    return "\n".join(linhas)


NOMES = "Antonio Francisca Jose Maria Raimundo Severina Cicero Josefa Joao Ana Francisco Luzia Manoel Rita Pedro Terezinha Sebastiao Damiana Expedito Socorro".split()
SOBRENOMES = "Silva Santos Oliveira Souza Lima Pereira Ferreira Alves Rodrigues Gomes Barbosa Araujo Nascimento Cavalcante Bezerra Torres Sampaio Brito Leite Moura".split()
CARGOS = [("Professor", "Educacao", 3800), ("Agente de Saude", "Saude", 1900), ("Gari", "Obras", 1600), ("Motorista", "Obras", 2200), ("Assistente Administrativo", "Administracao", 2100), ("Merendeira", "Educacao", 1550), ("Enfermeiro", "Saude", 4100), ("Vigia", "Administracao", 1500)]


def cpf_invalido(rnd):
    base = [rnd.randint(0, 9) for _ in range(9)]
    s = sum(d * (10 - i) for i, d in enumerate(base))
    d1 = (s * 10 % 11) % 10
    s = sum(d * (11 - i) for i, d in enumerate(base + [d1]))
    d2 = ((s * 10 % 11) % 10 + 1 + rnd.randint(0, 8)) % 10
    return "{}{}{}.{}{}{}.{}{}{}-{}{}".format(*(base + [d1, d2]))


def folha():
    rnd = random.Random(2009)
    caminho = os.path.join(ROOT, "srv/fs01/publico/folha_pagamento_2026-10.csv")
    with open(caminho, "w", encoding="utf-8") as f:
        f.write("matricula;nome;cpf;cargo;secretaria;salario_bruto\n")
        for i in range(1, 413):
            cargo, sec, sal = rnd.choice(CARGOS)
            nome = f"{rnd.choice(NOMES)} {rnd.choice(SOBRENOMES)} {rnd.choice(SOBRENOMES)}"
            f.write(f"{1000 + i};{nome};{cpf_invalido(rnd)};{cargo};{sec};{sal + rnd.randint(0, 900)},00\n")


def certificado():
    tls = os.path.join(ROOT, "etc/escopo/tls")
    os.makedirs(tls, exist_ok=True)
    subprocess.run(["openssl", "req", "-x509", "-newkey", "ec", "-pkeyopt", "ec_paramgen_curve:prime256v1", "-nodes",
                    "-days", "3650", "-keyout", f"{tls}/folhacerta.key", "-out", f"{tls}/folhacerta.crt",
                    "-subj", "/C=BR/O=FolhaCerta/CN=app.folhacerta.exemplo",
                    "-addext", "subjectAltName=DNS:app.folhacerta.exemplo"],
                   check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


os.makedirs(LDAP, exist_ok=True)
with open(os.path.join(LDAP, "dados.ldif"), "w") as f:
    f.write(ldif())
with open(os.path.join(LDAP, "dados-reteste.ldif"), "w") as f:
    f.write(ldif(reteste=True))
folha()
certificado()
open(os.path.join(ROOT, "etc/escopo/mundo.ativo"), "w").close()
print("mundo Bom Sossego gerado")
