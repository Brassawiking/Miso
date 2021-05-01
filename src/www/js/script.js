 console.log('lulz')

async function postData(url = '', data = {}) {
  const response = await fetch(url, {
    method: 'POST',
    cache: 'no-cache',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
  console.log(response)
}

postData('/test', { answer: 42 })


/*

  Allt är chat-kanaler!
  - Text chats (vanligt tjöt)
    - World
    - Local/Zone
  - Event "chats", async event bus
    - Zone
      - Player avatars
      - "I am doing this here" / Others respond in good faith
        Sänka skepp-ish, hur ska spam begränsas?


  Skapa en lekledare på servern! // Fokus på lek!
  "Lekledare, jag vill åstadkomma detta!"
  - Validera om det går
  - Utvärdera och uppdatera serverns egna state
  - Skicka ut en eller flera effects


  
  => 1-1 med cause and effect
  => Hur skulle en långvarig effekt hanteras?

  En spelare är lyssnar på en zon, 9 st lekledare skapas på servern


*/