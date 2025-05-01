package cmpe.project.Project.Endpoints;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/chatbot")
public class ChatbotEndPoints {


    private static final ObjectMapper mapper = new ObjectMapper();

    public static String callLocalLLM(Map<String, String> messages) throws Exception {
        // Build the messages array
        ArrayNode messagesArray = mapper.createArrayNode();
        for (Map.Entry<String, String> entry : messages.entrySet()) {
            ObjectNode message = mapper.createObjectNode();
            message.put("role", entry.getKey());
            message.put("content", entry.getValue());
            messagesArray.add(message);
        }

        // Build the request body
        ObjectNode requestBody = mapper.createObjectNode();
        requestBody.put("model", "local-model");  // Replace with your actual model name if needed
        requestBody.set("messages", messagesArray);
        requestBody.put("max_tokens", 1000);

        // Send the HTTP request
        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("http://localhost:5000/v1/chat/completions"))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(requestBody.toString()))
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        // Parse and return the assistant's reply
        ObjectNode jsonResponse = (ObjectNode) mapper.readTree(response.body());
        String content = jsonResponse
                .withArray("choices")
                .get(0)
                .get("message")
                .get("content")
                .asText();

        return content.trim();
    }

    @PostMapping("/ask")
    public ResponseEntity<?> handleChat(@RequestBody Map<String, Object> body) {
        String userMessage = ((String) body.getOrDefault("message", "")).toLowerCase();
        String reply;

        if (userMessage.contains("types of meat") || userMessage.contains("what meats do you have")) {
            reply = "We offer a variety of meats including beef, pork, chicken, lamb, and specialty cuts like wagyu beef and organic chicken.";
        } else if (userMessage.contains("order") || userMessage.contains("when will my order arrive")) {
            reply = "You can track your order by going to the 'Order List' section on your account page. Delivery times depend on your location, but typically, we deliver within 1-2 days.";
        } else if (userMessage.contains("customize cuts") || userMessage.contains("custom butcher services")) {
            reply = "Yes, we offer custom cuts. You can request your preferred cuts while placing an order or contact us directly through the 'Contact Us' section for special requests.";
        } else if (userMessage.contains("pricing") || userMessage.contains("how much is")) {
            reply = "Our prices vary by product and weight. You can check the prices directly on our website, or if you're looking for something specific, feel free to ask!";
        } else if (userMessage.contains("delivery") || userMessage.contains("shipping")) {
            reply = "We offer delivery services to most regions. Check the 'Delivery Page' for more details, including fees and time estimates.";
        } else {
            reply = "I'm sorry, I didn't quite understand that. Could you please rephrase or check out our FAQ section for more help?";
        }

        try{
            return ResponseEntity.ok().body(Map.of(
                    "msg", "success",
                    "message", callLocalLLM(Map.of("user", userMessage))
                            .replaceAll("(?s)<think>.*?</think>", "")

            ));
        }
        catch(Exception e){
            e.printStackTrace();
            return ResponseEntity.ok().body(Map.of(
                    "msg", "error",
                    "message", "Unable to contact local LLM"
            ));
        }

    }
}
