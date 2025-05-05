package cmpe.project.Project.Utility;

import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.Map;
import java.util.UUID;

import cmpe.project.Project.Utility.CustomExceptions.UnmatchingLengthException;

public class Util {

    public static void logHeaders(String endpoint, Map<String, String> headers) {
        System.out.println("Request to " + endpoint + " with headers:");
        headers.forEach((key, value) -> System.out.println("  " + key + ": " + value));
    }

    public static String sanitizeShellArg(String input) {
        return input.replace("'", "");
    }

    public static void sendSMS(String phoneNumber, String message) {
        String cleanedNumber = phoneNumber.replaceAll("[^0-9+]", "");
        message = message.replace("\n", "\\n");

        String jsonPayload = String.format(
                "{\"phoneNumber\": \"%s\", \"message\": \"%s\"}",
                cleanedNumber,
                message
        );

        try {
            // Set up HTTP connection
            URL url = new URL("http://phone:5000/sms");
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setDoOutput(true);

            // Write JSON payload
            try (OutputStream os = conn.getOutputStream()) {
                os.write(jsonPayload.getBytes(StandardCharsets.UTF_8));
            }

            // Handle response (optional)
            int responseCode = conn.getResponseCode();
            System.out.println("Sent message. Response code: " + responseCode);
        } catch (Exception e) {
            System.err.println("Error sending message: " + e.getMessage());
        }
    }

    public static UUID getUuidOrNull(String s){
        try{
            return UUID.fromString(s);
        }
        catch(Exception e){
            return null;
        }
    }

    public static Map<String, String> JsonResponder(String key, String status){
        Map<String, String> response = new HashMap<>();
        response.put(key, status);
        return response;
    }

    public static Map<Object, Object> JsonResponder(Object[] key, Object[] value){
        if(key.length != value.length)
            throw new UnmatchingLengthException(key.length, value.length);
        Map<Object, Object> response = new HashMap<>();
        for(int i = 0; i<key.length; i++){
            response.put(key[i], value[i]);
        }
        return response;

    }
}
