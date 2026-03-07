let IS_PROD = true;
const server = IS_PROD
  ? "https://video-call-backend-dfma.onrender.com"
  : "http://localhost:8000";

export default server;
