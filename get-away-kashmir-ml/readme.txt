// Example JavaScript fetch request
const answers = [0,0,1,-1,0,1,1,0,0,0,0,1,1,-1,0,0,-1,0,0,1,0,-1,0,0,1,0,-1,0,-1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];

fetch('http://localhost:5000/predict', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ answers: answers })
})
.then(response => response.json())
.then(data => {
    console.log("Predicted Personality:", data.personality);
    // Store in your database here
});