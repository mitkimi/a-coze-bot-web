export function JSONResponse(
  code = 0,
  message = 'ok',
  data = []
) {
  const ret = DefaultResponse(code, message, data)
  return JSON.stringify(ret)
}