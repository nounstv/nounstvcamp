// Sem Sentry: erros vão para o console (e para o log do processo no servidor).
export const reportError = (error) => {
  console.error(error);
};
