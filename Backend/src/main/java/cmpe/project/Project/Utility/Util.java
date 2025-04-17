package cmpe.project.Project.Utility;

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

    public static void sendSMS(String phoneNumber, String message) throws Exception {
        phoneNumber = phoneNumber.replaceAll("[^0-9+]", "");
        String remoteCmd = "bash -c 'termux-sms-send -n \"" + phoneNumber + "\" \"" + sanitizeShellArg(message) + "\"'";
        String command = "ssh phonePush \"" + remoteCmd + "\"";

        System.out.println("Sending SMS: " + command);


        Process process = Runtime.getRuntime().exec(command);

        // Read standard output
        BufferedReader stdOut = new BufferedReader(new InputStreamReader(process.getInputStream()));
        String line;
        while ((line = stdOut.readLine()) != null) {
            System.out.println("[STDOUT] " + line);
        }

        // Read error output
        StringBuilder errorMessage = new StringBuilder();
        BufferedReader stdErr = new BufferedReader(new InputStreamReader(process.getErrorStream()));
        while ((line = stdErr.readLine()) != null) {
            errorMessage.append("[STDERR] ").append(line).append("\n");
        }

        if(!errorMessage.isEmpty()){
            throw new Exception(errorMessage.toString());
        }

        process.waitFor();
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
