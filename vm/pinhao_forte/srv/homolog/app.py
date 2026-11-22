"""Homologação do Pinhão Digital, mantida pela CodeRápido.

A página /status mostra uma amostra da base. Na fase "teste" a base é cópia
de produção sem máscara (dados fictícios, CPFs inválidos de propósito). No
"reteste" a amostra vem mascarada, mas a base continua sendo cópia de produção.
"""
import json
import os

FASE = os.environ.get("EF_FASE", "teste")

AMOSTRA = [
    {"nome": "Zbigniew Kowalczyk", "cpf": "418.207.553-10", "agencia": "0001", "saldo": 18240.55},
    {"nome": "Irene Wisniewska Lopes", "cpf": "072.913.684-21", "agencia": "0003", "saldo": 920.10},
    {"nome": "Tadeu Nowak Ferreira", "cpf": "335.640.129-02", "agencia": "0002", "saldo": 45310.00},
]


def _mascarar(r):
    cpf = r["cpf"]
    nome = r["nome"].split()
    return {
        "nome": f"{nome[0]} {nome[-1][0]}.",
        "cpf": f"{cpf[:3]}.***.***-{cpf[-2:]}",
        "agencia": r["agencia"],
        "saldo": "***",
    }


def tratar(metodo, caminho, cabecalhos, corpo):
    if caminho.split("?")[0].rstrip("/") != "/status":
        return None
    amostra = [_mascarar(r) for r in AMOSTRA] if FASE == "reteste" else AMOSTRA
    dados = {
        "ambiente": "homologacao",
        "versao": "2.4.0-rc3",
        "base": "copia de producao de 2026-10-01",
        "associados": 4310,
        "amostra": amostra,
        "mantido_por": "CodeRapido Sistemas",
    }
    return 200, "application/json; charset=utf-8", json.dumps(dados, ensure_ascii=False, indent=2) + "\n"
