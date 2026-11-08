import { onRequestPost as __api_event_js_onRequestPost } from "D:\\Mis Programas\\Juego ONU\\functions\\api\\event.js"
import { onRequestPost as __api_score_js_onRequestPost } from "D:\\Mis Programas\\Juego ONU\\functions\\api\\score.js"
import { onRequestGet as __api_top_js_onRequestGet } from "D:\\Mis Programas\\Juego ONU\\functions\\api\\top.js"

export const routes = [
    {
      routePath: "/api/event",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_event_js_onRequestPost],
    },
  {
      routePath: "/api/score",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_score_js_onRequestPost],
    },
  {
      routePath: "/api/top",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_top_js_onRequestGet],
    },
  ]