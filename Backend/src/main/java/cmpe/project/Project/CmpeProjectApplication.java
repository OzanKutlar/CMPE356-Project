package cmpe.project.Project;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
		SpringApplication.run(CmpeProjectApplication.class, args);
	}

	@GetMapping("/hello")
	public String sayHello() {
		return "Hello, Haratres!";
	}



	@GetMapping("/endpoint2")
	public ResponseEntity<?> getEndpoint2(@RequestHeader Map<String, String> headers) {
		// Process all headers
		headers.forEach((key, value) -> System.out.println(key + ": " + value));
		return ResponseEntity.ok().body(Map.of("data", "Data for Endpoint 2"));
	}










}
