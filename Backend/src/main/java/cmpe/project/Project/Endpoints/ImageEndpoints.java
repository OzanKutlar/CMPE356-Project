package cmpe.project.Project.Endpoints;


import cmpe.project.Project.Endpoints.UserEndpoints;
import cmpe.project.Project.Utility.Util;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;
import java.util.Base64;
import java.util.Map;

@RestController
@RequestMapping("/api/image")
public class ImageEndpoints {

    private static final String IMAGE_DIR = "images";

    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(@RequestBody Map<String, String> requestBody) {
        String frontUserID = requestBody.get("userID");
        String pictureData = requestBody.get("pictureData");
        String filetype = requestBody.get("fileName");

        String userID = UserEndpoints.sessionMap.get(Util.getUuidOrNull(frontUserID));

        if(userID == null){
            return ResponseEntity.ok().body(Map.of("msg", "error", "message", "You need to be logged in before you upload a file."));
        }

        try {
            byte[] imageBytes = Base64.getDecoder().decode(pictureData);

            File dir = new File(IMAGE_DIR);
            if (!dir.exists()) dir.mkdirs();

            String filename = "user_" + userID + "_" + Instant.now().toEpochMilli() + "." + filetype;
            File file = Paths.get(IMAGE_DIR, filename).toFile();

            try (FileOutputStream fos = new FileOutputStream(file)) {
                fos.write(imageBytes);
            }

            String imageUrl = "/images/" + filename;

            return ResponseEntity.ok().body(Map.of("msg", "success", "url", imageUrl));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid base64 data.");
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Could not save file.");
        }
    }

    @GetMapping("/get/{imageName}")
    public ResponseEntity<Resource> getImage(@PathVariable String imageName) {
        try {
            Path imagePath = Paths.get(IMAGE_DIR).resolve(imageName).normalize();
            File imageFile = imagePath.toFile();

            if (!imageFile.exists()) {
                return ResponseEntity.notFound().build();
            }

            Resource resource = new UrlResource(imageFile.toURI());

            return ResponseEntity.ok()
                    .contentType(MediaType.IMAGE_JPEG)
                    .body(resource);

        } catch (MalformedURLException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
