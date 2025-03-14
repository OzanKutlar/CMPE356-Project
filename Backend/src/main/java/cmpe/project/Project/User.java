package cmpe.project.Project;

import java.util.HashMap;
import java.util.Map;

public class User {
    private String id;
    private String name;
    private String email;
    private int age;
    private String address;
    private String profilePictureLink;
    private String username;
    private String password;

    // Constructor
    public User(String id, String name, String email, int age, String address,
                String profilePictureLink, String username, String password) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.age = age;
        this.address = address;
        this.profilePictureLink = profilePictureLink;
        this.username = username;
        this.password = password;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public int getAge() {
        return age;
    }

    public void setAge(int age) {
        this.age = age;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getProfilePictureLink() {
        return profilePictureLink;
    }

    public void setProfilePictureLink(String profilePictureLink) {
        this.profilePictureLink = profilePictureLink;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    // Convert User object to HashMap (excluding password)
    public Map<String, Object> toHashMap() {
        Map<String, Object> userMap = new HashMap<>();
        userMap.put("id", id);
        userMap.put("name", name);
        userMap.put("email", email);
        userMap.put("age", age);
        userMap.put("address", address);
        userMap.put("profilePictureLink", profilePictureLink);
        userMap.put("username", username);
        // Password is intentionally not added to the map for security reasons
        return userMap;
    }

    @Override
    public String toString() {
        return "User{" +
                "id='" + id + '\'' +
                ", name='" + name + '\'' +
                ", email='" + email + '\'' +
                ", age=" + age +
                ", address='" + address + '\'' +
                ", profilePictureLink='" + profilePictureLink + '\'' +
                ", username='" + username + '\'' +
                ", password='[PROTECTED]'" + // Hiding password in logs
                '}';
    }
}
