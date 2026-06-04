export async function handler(event, context) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  // On appelle la variable spécifique aux soumissions
  const googleScriptUrl = process.env.URL_GOOGLE_SOUMISSION;

  if (!googleScriptUrl) {
    return { statusCode: 500, body: JSON.stringify({ error: "Variable URL_GOOGLE_SOUMISSION manquante." }) };
  }

  try {
    const response = await fetch(googleScriptUrl, {
      method: "POST",
      body: event.body,
      headers: { "Content-Type": "application/x-www-form-urlencoded" }
    });
    const data = await response.json();
    return { statusCode: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: "Erreur serveur de soumission" }) };
  }
}