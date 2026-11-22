"""Sistema de pedidos do Boi na Nuvem (Ato 1: só a tela de login existe)."""


def tratar(metodo, caminho, cabecalhos, corpo):
    if metodo == "POST" and caminho.startswith("/login"):
        pagina = (
            "<!DOCTYPE html><html lang='pt-BR'><head><meta charset='utf-8'><title>Login</title></head>"
            "<body style='font-family: Verdana, sans-serif; max-width: 420px; margin: 3em auto;'>"
            "<h1>Sistema de Pedidos</h1><p>Usuário ou senha inválidos.</p>"
            "<p><a href='/'>Voltar</a></p></body></html>"
        )
        return 200, "text/html; charset=utf-8", pagina
    return None
