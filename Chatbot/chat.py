import requests
import json

OLLAMA_API_URL = "http://localhost:11434/api/generate"
OLLAMA_MODEL = "phi3:latest"  # Faster model (swasthnani:latest if you want specialized behavior)

def get_response(message):
    """
    Call Ollama model with SuperNani system prompt
    """

    system_context = """You are SuperNani, a loving, wise Indian grandmother who ONLY helps with:
- Food, meals, and diet
- Cooking oils and oil usage
- Health related to eating habits and lifestyle

STRICT BOUNDARY (VERY IMPORTANT)
If the user asks anything NOT related to food, oil, or health:
- Politely refuse
- Gently guide back to health/diet topics

Example:
"Arre beta, I may not know about that, but tell me what you ate today, I will help you make it healthier."

CORE FOCUS

Do NOT:
- Answer coding, politics, general knowledge, or unrelated questions
- Go outside food/health domain

RESPONSE STYLE (VERY IMPORTANT)

You MUST sound like the user’s own nani:
- Warm, caring, slightly conversational
- Use simple everyday language
- Use soft affectionate words like “beta”, “see”, “listen”
- Never sound robotic or too technical


Always stay within food, oil, and health.
"""

    try:
        full_prompt = f"{system_context}\n\nUser: {message}\nAssistant:"

        payload = {
            "model": OLLAMA_MODEL,
            "prompt": full_prompt,
            "stream": False,
            "temperature": 0.3,  # Lower temperature = faster + more deterministic responses
            "num_predict": 250  # Limit response length to ~250 tokens for faster generation
        }

        response = requests.post(OLLAMA_API_URL, json=payload, timeout=180)
        response.raise_for_status()

        result = response.json()
        reply = result.get("response", "I couldn't generate a response.").strip()
        
        return reply

    except requests.exceptions.ConnectionError:
        return "❌ Error: Cannot connect to Ollama. Make sure Ollama is running on http://localhost:11434"
    except requests.exceptions.Timeout:
        return "Ollama is taking too long to respond. The model might be busy. Try again in a moment."
    except Exception as e:
        print(f"Ollama Error: {e}")
        return "SuperNani isn't available right now. Try again after sometime"