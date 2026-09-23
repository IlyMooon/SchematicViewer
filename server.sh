#!/usr/bin/env bash
# ==============================================================================
# Script de contrôle du serveur SchematicViewer (Start / Stop / Status / Restart)
# ==============================================================================

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR" || exit 1

PID_FILE="$DIR/.server.pid"
LOG_FILE="$DIR/server.log"
PORT=5173

get_pid() {
  if [ -f "$PID_FILE" ]; then
    cat "$PID_FILE"
  else
    echo ""
  fi
}

is_running() {
  local pid
  pid=$(get_pid)
  if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then
    return 0
  fi
  # Fallback: check if port 5173 is in use by node / vite
  local port_pid
  port_pid=$(lsof -ti :$PORT 2>/dev/null | head -n 1)
  if [ -n "$port_pid" ]; then
    echo "$port_pid" > "$PID_FILE"
    return 0
  fi
  return 1
}

start_server() {
  if is_running; then
    local pid
    pid=$(get_pid)
    echo "🟢 Le serveur SchematicViewer est déjà en cours d'exécution !"
    echo "   • PID : $pid"
    echo "   • URL : http://localhost:$PORT/"
    return 0
  fi

  echo "🚀 Démarrage du serveur SchematicViewer..."
  # Lancer vite en arrière-plan
  nohup npm run dev > "$LOG_FILE" 2>&1 &
  local new_pid=$!
  echo "$new_pid" > "$PID_FILE"

  # Attendre quelques secondes que le serveur réponde
  local count=0
  while [ $count -lt 15 ]; do
    if curl -s "http://localhost:$PORT/" > /dev/null 2>&1; then
      break
    fi
    sleep 0.5
    count=$((count + 1))
  done

  if is_running; then
    echo "✅ Serveur démarré avec succès !"
    echo "   • PID  : $new_pid"
    echo "   • URL  : http://localhost:$PORT/"
    echo "   • Logs : $LOG_FILE"
    echo ""
    echo "💡 Pour arrêter le serveur : ./server.sh stop"
  else
    echo "❌ Erreur au démarrage du serveur. Consultez $LOG_FILE pour les détails :"
    tail -n 15 "$LOG_FILE"
    return 1
  fi
}

stop_server() {
  local pid
  pid=$(get_pid)

  if ! is_running && [ -z "$pid" ]; then
    echo "⚪ Le serveur SchematicViewer n'est pas en cours d'exécution."
    [ -f "$PID_FILE" ] && rm -f "$PID_FILE"
    return 0
  fi

  echo "🛑 Arrêt du serveur SchematicViewer (PID: $pid)..."

  if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then
    kill "$pid" 2>/dev/null
    sleep 1
    if kill -0 "$pid" 2>/dev/null; then
      kill -9 "$pid" 2>/dev/null
    fi
  fi

  # Vérifier également tout processus sur le port 5173
  local port_pid
  port_pid=$(lsof -ti :$PORT 2>/dev/null)
  if [ -n "$port_pid" ]; then
    kill -9 $port_pid 2>/dev/null
  fi

  rm -f "$PID_FILE"
  echo "✅ Serveur arrêté avec succès."
}

status_server() {
  if is_running; then
    local pid
    pid=$(get_pid)
    echo "🟢 Le serveur SchematicViewer est ACTIF."
    echo "   • PID  : $pid"
    echo "   • URL  : http://localhost:$PORT/"
    echo "   • Logs : $LOG_FILE"
  else
    echo "⚪ Le serveur SchematicViewer est ACTUELLEMENT ARRÊTÉ."
    echo "💡 Pour le démarrer : ./server.sh start"
  fi
}

# --- Dispatch des commandes ---
case "$1" in
  start)
    start_server
    ;;
  stop)
    stop_server
    ;;
  restart)
    stop_server
    sleep 1
    start_server
    ;;
  status)
    status_server
    ;;
  *)
    echo "======================================================"
    echo "  Minecraft Schematic Viewer - Contrôle du Serveur"
    echo "======================================================"
    status_server
    echo ""
    echo "Usage : ./server.sh [start | stop | restart | status]"
    echo ""
    echo "Commandes disponibles :"
    echo "  ./server.sh start    -> Démarre le serveur en arrière-plan"
    echo "  ./server.sh stop     -> Arrête le serveur"
    echo "  ./server.sh restart  -> Redémarre le serveur"
    echo "  ./server.sh status   -> Affiche l'état actuel et l'URL"
    echo "======================================================"
    ;;
esac
