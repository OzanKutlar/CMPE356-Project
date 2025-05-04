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
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/chatbot")
public class ChatbotEndPoints {


    private static final ObjectMapper mapper = new ObjectMapper();
//    private static final String modelURL = "http://localhost:5000/v1/chat/completions";
    private static final String modelURL = "http://100.104.199.33:8080/v1/chat/completions";

    public static String callLocalLLM(Map<String, String> messages) throws Exception {
        return callLocalLLM(messages, false);
    }

    public static String callLocalLLM(Map<String, String> messages, boolean giveThink) throws Exception {
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
                .uri(URI.create(modelURL))
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
        if(giveThink){
            return content.trim();
        }
        return content.trim().replaceAll("(?s)<think>.*?</think>", "").trim();
    }

    @PostMapping("/ask")
    public ResponseEntity<?> handleChat(@RequestBody Map<String, Object> body) {
        String userMessage = ((String) body.getOrDefault("message", "")).toLowerCase();
        String userID = ((String) body.getOrDefault("userID", "")).toLowerCase();
        ArrayList<Map<String, String>> history = (ArrayList<Map<String, String>>) body.getOrDefault("history", "");
        String reply;

        StringBuilder userHistory = new StringBuilder();
        for (Map<String, String> message : history) {
            userHistory.append(message.get("role")).append(" : ").append(message.get("content")).append("\n");
        }

        String additionalInfo = "";
        try {
            String action = callLocalLLM(Map.of(
                    "system", "\"Act as a helpdesk agent with access to the user’s database. Your role is to interpret user queries and execute commands related to order management. Follow these rules:   \n" +
                            "\n" +
                            "     \n" +
                            "\n" +
                            "    Command Parsing:   \n" +
                            "         If the user’s message contains 'cancel' followed by an order number (e.g., 'Cancel order 123'), output: (cancel 123).  \n" +
                            "         If the user asks to 'see orders', output: (see orders) to retrieve all orders for the user.  \n" +
                            "         If the user requests 'info latest', output: (info latest) to fetch details of the most recent order.  \n" +
                            "         If the user wants information about a certain order, 'info x' (e.g., 'Show info for order 456'), output: (info 456).  \n" +
                            "         For regular text responses (not commands), output: (text)\n" +
                            "         Note that you should **only** give the outputted in paranthesis. No extra information. Just whether its an action like (cancel) or a (text) response. Another agent will respond with text if you do (text)",
                    "history", userHistory.toString(),
                    "user", userMessage));


            if(!action.equals("(text)")){
                if(userID.equals("")){
                    return ResponseEntity.ok().body(Map.of(
                            "msg", "usernotfound"
                    ));
                }

                switch (action){
                    case "(info latest)":

                }
            }

            System.out.println("Predicted action : " + action);
        } catch (Exception e) {
            e.printStackTrace();
//            throw new RuntimeException(e);
        }


        try{
            return ResponseEntity.ok().body(Map.of(
                    "msg", "success",
                    "message", callLocalLLM(Map.of(
                            "system", "You are a helpdesk provider to a website called MeatGo. Which is an online butcher store. Provide help as such.",
                            "additionalInfo", resultOfRAG,
                            "history", userHistory.toString(),
                            "user", userMessage))

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
