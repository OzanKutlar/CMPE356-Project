package cmpe.project.Project;

import cmpe.project.Project.DatabaseHandler.DatabaseHandler;
import cmpe.project.Project.Utility.Logger;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

import static cmpe.project.Project.Utility.Util.logHeaders;

@SpringBootApplication
@RestController
@RequestMapping("/api")
@ComponentScan(basePackages = {"cmpe.project.Project", "cmpe.project.Project.Endpoints"})
public class CmpeProjectApplication {

	public static void main(String[] args) {
		DatabaseHandler.createInstance();
		try {
			ResultSet rs = DatabaseHandler.INSTANCE.sendRequest("SHOW DATABASES LIKE 'cmpe356'", null);

			if (rs != null) {
				System.out.println("Database 'cmpe356' exists.");
			} else {
				System.out.println("Database 'cmpe356' does not exist.");
			}
		} catch (SQLException e) {
			e.printStackTrace();
		}
		SpringApplication.run(CmpeProjectApplication.class, "--server.port=33000");
	}

	@GetMapping("/hello")
	public String sayHello() {
		Logger.log("Test Endpoint Triggered.");
		return "Hello, Haratres!";
	}



	@GetMapping("/endpoint2")
	public ResponseEntity<?> getEndpoint2(@RequestHeader Map<String, String> headers) {
		// Process all headers
		logHeaders("endpoint2", headers);
		return ResponseEntity.ok().body(Map.of("data", "Data for Endpoint 2"));
	}










}
