package cmpe.project.Project.Utility;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.Map;
import java.util.UUID;

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


}
