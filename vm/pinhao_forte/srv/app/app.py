"""API do Pinhão Digital (app da cooperativa), feita pela fábrica CodeRápido.

Fase "teste": documentação aberta e erro verboso. Fase "reteste": a fábrica
fechou a documentação e trocou o erro por uma mensagem genérica.
"""
import json
import os
import urllib.parse

FASE = os.environ.get("EF_FASE", "teste")

DOCS = {
    "openapi": "3.0.1",
    "info": {
        "title": "Pinhão Digital API",
        "version": "2.3.1",
        "description": "API do app Pinhão Digital. Desenvolvido por CodeRápido Sistemas.",
        "contact": {"name": "Kelly (CodeRápido)", "url": "https://git.coderapido.exemplo/pinhao/app"},
    },
    "servers": [
        {"url": "https://app.pinhaoforte.exemplo/api", "description": "produção"},
        {"url": "https://homolog-app.pinhaoforte.exemplo:8443/api", "description": "homologação"},
    ],
    "paths": {
        "/v1/cotacao": {"get": {"summary": "Cotação de moedas", "parameters": [{"name": "moeda", "in": "query"}]}},
        "/v1/agencias": {"get": {"summary": "Lista de agências"}},
        "/v1/conta/saldo": {"get": {"summary": "Saldo do associado", "security": [{"token": []}]}},
        "/v1/interno/exportar-associados": {
            "get": {
                "summary": "Exporta todos os associados em CSV (USO INTERNO, NAO PUBLICAR)",
                "x-interno": True,
                "security": [{"token": []}],
            }
        },
    },
}

AGENCIAS = [
    {"codigo": "0001", "cidade": "Curitiba", "bairro": "Água Verde"},
    {"codigo": "0002", "cidade": "Ponta Grossa", "bairro": "Centro"},
    {"codigo": "0003", "cidade": "União da Vitória", "bairro": "São Bernardo"},
]

TAXAS = {"BRL": 1.0, "USD": 5.41, "EUR": 5.87, "PLN": 1.36}

PILHA = """Error: Moeda nao suportada: {moeda}
    at CotacaoService.buscar (/opt/coderapido/pinhao-api/src/services/cotacao.js:42:11)
    at Layer.handle [as handle_request] (/opt/coderapido/pinhao-api/node_modules/express/lib/router/layer.js:95:5)
    at PgPool.connect (host=db-core.pinhao.interno port=5432 database=pinhao_prod user=api_pinhao)
    at process._tickCallback (internal/process/next_tick.js:68:7)
Express 4.16.0 / Node.js v8.17.0"""


def _json(status, dados):
    return status, "application/json; charset=utf-8", json.dumps(dados, ensure_ascii=False, indent=2) + "\n"


def tratar(metodo, caminho, cabecalhos, corpo):
    url = urllib.parse.urlsplit(caminho)
    q = urllib.parse.parse_qs(url.query)
    p = url.path.rstrip("/")

    if p == "/api/docs/openapi.json":
        if FASE == "reteste":
            return _json(401, {"erro": "autenticação necessária"})
        return _json(200, DOCS)
    if p == "/api/v1/agencias":
        return _json(200, AGENCIAS)
    if p == "/api/v1/cotacao":
        moeda = (q.get("moeda") or ["BRL"])[0].upper()
        if moeda in TAXAS:
            return _json(200, {"moeda": moeda, "taxa": TAXAS[moeda]})
        if FASE == "reteste":
            return _json(400, {"erro": "Moeda inválida."})
        return 500, "text/plain; charset=utf-8", PILHA.format(moeda=moeda) + "\n"
    if p.startswith("/api/v1/conta") or p.startswith("/api/v1/interno"):
        return _json(401, {"erro": "token ausente ou inválido"})
    if p.startswith("/api"):
        return _json(404, {"erro": "rota não encontrada"})
    return None
