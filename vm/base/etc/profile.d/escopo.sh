# Ambiente do terminal da pentester. Cada comando digitado e avisado ao
# jogo pela serial 1, para o jogo explicar o comando e acompanhar o escopo.
[ -n "$BASH_VERSION" ] || return 0

export LANG=C.UTF-8
export TERM=xterm-256color
export EDITOR=nano
HISTSIZE=5000
HISTCONTROL=
PS1='\[\e[38;5;46m\]pentester\[\e[0m\]@\[\e[38;5;120m\]\h\[\e[0m\]:\[\e[1;38;5;157m\]\w\[\e[0m\]\$ '

__ef_ultimo=0
__ef_cmd() {
  local linha num cmd
  linha=$(HISTTIMEFORMAT='' builtin history 1)
  num=${linha%%[!0-9 ]*}
  num=${num// /}
  cmd=${linha#*[0-9]  }
  if [ -n "$num" ] && [ "$num" != "$__ef_ultimo" ]; then
    __ef_ultimo=$num
    printf 'EF:CMD %s\t%s\n' "$PWD" "$cmd" > /dev/ttyS1 2>/dev/null
  fi
}
PROMPT_COMMAND=__ef_cmd

alias ls='ls --color=auto'
alias ll='ls -la --color=auto'
alias grep='grep --color=auto'
