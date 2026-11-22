#!/usr/bin/env bash
# Monta a imagem Linux (kernel + initramfs) que roda no navegador via v86.
# Roda como root numa distro Linux x86_64 (usamos a WSL besafe-build).
# Uso: construir.sh <cenario> <saida>
#   construir.sh boi_na_nuvem /mnt/c/Projetos/Escopo_Fechado/public/vm/boi_na_nuvem
set -euo pipefail

CENARIO="${1:?cenario}"
SAIDA="$(mkdir -p "${2:?pasta de saida}" && cd "$2" && pwd)"
AQUI="$(cd "$(dirname "$0")" && pwd)"
REPO="$(cd "$AQUI/../.." && pwd)"
TRAB="/root/escopo/$CENARIO"
ALPINE="v3.22"
MIRROR="https://dl-cdn.alpinelinux.org/alpine"
ROOT="$TRAB/rootfs"

mkdir -p "$TRAB" "$SAIDA"
cd "$TRAB"

# apk estatico do host, para instalar pacotes x86 (32 bits) num diretorio
if [ ! -x "$TRAB/apk.static" ]; then
  PKG=$(curl -s "$MIRROR/$ALPINE/main/x86_64/" | grep -o 'apk-tools-static-[^"]*\.apk' | head -1)
  curl -s -o apk-static.apk "$MIRROR/$ALPINE/main/x86_64/$PKG"
  tar -xzf apk-static.apk sbin/apk.static 2>/dev/null || true
  mv sbin/apk.static "$TRAB/apk.static"
fi

PACOTES="$(grep -v '^#' "$AQUI/pacotes.txt" | xargs)"
# pacotes só deste cenário (ex.: diretório e compartilhamentos da prefeitura)
if [ -f "$AQUI/pacotes-$CENARIO.txt" ]; then
  PACOTES="$PACOTES $(grep -v '^#' "$AQUI/pacotes-$CENARIO.txt" | xargs)"
fi

rm -rf "$ROOT"
mkdir -p "$ROOT/etc/apk"
printf '%s\n%s\n' "$MIRROR/$ALPINE/main" "$MIRROR/$ALPINE/community" > "$ROOT/etc/apk/repositories"
"$TRAB/apk.static" --arch x86 --root "$ROOT" --initdb --allow-untrusted \
  --repositories-file "$ROOT/etc/apk/repositories" --no-cache add $PACOTES >/dev/null

# Registro das versoes exatas (para a oferta de codigo-fonte das licencas GPL)
"$TRAB/apk.static" --arch x86 --root "$ROOT" info -v 2>/dev/null | sort > "$SAIDA/pacotes-versoes.txt"

# Kernel fica de fora do initramfs
cp "$ROOT/boot/vmlinuz-virt" "$SAIDA/bzimage"

# Enxuga: so os modulos de que o mundo precisa
KVER=$(ls "$ROOT/lib/modules")
MODS="$ROOT/lib/modules/$KVER"
find "$MODS/kernel" -type f ! -name 'veth.ko*' -delete
find "$MODS/kernel" -type d -empty -delete
test -n "$(find "$MODS/kernel" -name 'veth.ko*')" || { echo "veth.ko sumiu do kernel" >&2; exit 1; }
# carregado com insmod no init (o depmod do host nao gera indice valido para o Alpine)
find "$MODS/kernel" -name "veth.ko.gz" -exec gunzip -f {} +
cp "$(find "$MODS/kernel" -name veth.ko)" "$ROOT/lib/modules/veth.ko"
rm -rf "$ROOT/boot" "$ROOT/usr/share/man" "$ROOT/usr/share/doc" "$ROOT/usr/share/info" \
  "$ROOT/var/cache/apk"/* "$ROOT/lib/firmware" "$ROOT/usr/lib/python3"*/test \
  "$ROOT/usr/lib/python3"*/idlelib "$ROOT/usr/lib/python3"*/tkinter \
  "$ROOT/usr/lib/python3"*/ensurepip "$ROOT/usr/lib/python3"*/lib2to3
# mantém os .pyc do Alpine (python3-pycache-pyc0): sem eles o boot compila a stdlib toda vez

# Base comum (init, usuario, vigia) e depois o mundo do cenario
# --no-preserve: arquivos vindos do disco do Windows chegam com modo 777
cp -r --no-preserve=mode,ownership "$REPO/vm/base/." "$ROOT/"
cp -r --no-preserve=mode,ownership "$REPO/vm/$CENARIO/." "$ROOT/"
chmod 755 "$ROOT/init" "$ROOT/usr/local/sbin/"* "$ROOT/etc/escopo/"*.sh 2>/dev/null || true

# Artefatos gerados do mundo (histórico git, planilhas, chaves)
if [ -f "$AQUI/gerar-$CENARIO.py" ]; then
  python3 "$AQUI/gerar-$CENARIO.py" "$ROOT"
fi
# initramfs
( cd "$ROOT" && find . -print0 | cpio --null -o -H newc --quiet ) | gzip -9 > "$SAIDA/initrd"
ls -la "$SAIDA"
du -sh "$ROOT"
