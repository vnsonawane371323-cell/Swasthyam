import json

# Load oil data
with open("oils.json") as f:
    oils = json.load(f)

def get_oil_context(query):
    query = query.lower()
    results = []

    for oil in oils:
        text = f"{oil['name']} {oil['best_for']} {oil['health']} {oil['risks']}"
        
        # Simple keyword matching
        if any(word in text.lower() for word in query.split()):
            results.append(oil)

    # Return top 3 matches
    return results[:3]


# TEST
if __name__ == "__main__":
    q = "best oil for frying"
    result = get_oil_context(q)
    print(result)