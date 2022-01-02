# pip3 install google_speech
# sudo apt-get install libsox-fmt-mp3

from google_speech import Speech

# words slightly filtered from from https://en.wikipedia.org/wiki/Dolch_word_list
words = ["and", "away", "big", "blue", "can", "come", "down", "find", "for", "funny", "go", "help", "here", "in",
         "is", "it", "jump", "little", "look", "make", "me", "my", "not", "one", "play", "red", "run", "said", "see",
         "the", "three", "to", "two", "up", "we", "where", "yellow", "you", "all", "am", "are", "at", "ate", "be",
         "black", "brown", "but", "came", "did", "do", "eat", "four", "get", "good", "have", "he", "into", "like",
         "must", "new", "no", "now", "on", "our", "out", "please", "pretty", "ran", "ride", "saw", "say", "she",
         "so", "soon", "that", "there", "they", "this", "too", "under", "want", "was", "well", "went", "what",
         "white", "who", "will", "with", "yes", "after", "again", "an", "any", "as", "ask", "by", "could", "every",
         "fly", "from", "give", "going", "had", "has", "her", "him", "his", "how", "just", "know", "let", "live",
         "may", "of", "old", "once", "open", "over", "put", "round", "some", "stop", "take", "thank", "them", "then",
         "think", "walk", "were", "when", "always", "around", "because", "been", "before", "best", "both", "buy",
         "call", "cold", "does", "fast", "first", "five", "found", "gave", "goes", "green", "its", "made",
         "many", "off", "or", "pull", "read", "right", "sing", "sit", "sleep", "tell", "their", "these", "those",
         "upon", "us", "use", "very", "wash", "which", "why", "wish", "work", "would", "write", "your", "about",
         "better", "bring", "carry", "clean", "cut", "done", "draw", "drink", "eight", "fall", "far", "full", "got",
         "grow", "hold", "hot", "hurt", "if", "keep", "kind", "laugh", "light", "long", "much", "myself", "never",
         "only", "own", "pick", "seven", "shall", "show", "six", "small", "start", "ten", "today", "together", "try",
         "warm", "apple", "baby", "back", "ball", "bear", "bed", "bell", "bird", "birthday", "boat", "box", "boy",
         "bread", "brother", "cake", "car", "cat", "chair", "chicken", "children", "coat", "corn",
         "cow", "day", "dog", "doll", "door", "duck", "egg", "eye", "farm", "farmer", "father", "feet", "fire",
         "fish", "floor", "flower", "game", "garden", "girl", "grass", "ground", "hand", "head", "hill",
         "home", "horse", "house", "kitty", "leg", "letter", "man", "men", "milk", "money", "morning", "mother",
         "name", "nest", "night", "paper", "party", "picture", "pig", "rabbit", "rain", "ring", "robin", "school",
         "seed", "sheep", "shoe", "sister", "snow", "song", "squirrel", "stick", "street", "sun", "table", "thing",
         "time", "top", "toy", "tree", "watch", "water", "way", "wind", "window", "wood"]

print("Downloading all sounds to local folder...")

for i, word in enumerate(words):
    speech = Speech(word, "en")
    filename = f"{word}.mp3"

    print(f"word {i+1}/{len(words)}: {filename}")
    speech.save(filename)

praises = ["good job", "nice work", "success", "great work", "keep going", "you're doing great",
           "correct", "that's right", "you're right"]

for i, praise in enumerate(praises):
    speech = Speech(praise, "en")
    filename = f"praise{i}.mp3"

    print(f"praise {i+1}/{len(praises)}: {filename}")
    speech.save(filename)

####################
speech = Speech("try again", "en")
filename = "wrong.mp3"

print(f"{filename}")
speech.save(filename)

print("Done!")
