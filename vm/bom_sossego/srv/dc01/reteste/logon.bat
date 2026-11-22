@echo off
REM Script de logon da Prefeitura - Clodoaldo, 2011 (revisado 2026, tirei a senha)
net use H: \fs01\Publico
net use F: \fs01\Financas
net time \dc01 /set /yes
echo Bem-vindo a rede da Prefeitura de Sao Jeronimo do Bom Sossego
