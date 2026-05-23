package com.abdul.accessportal;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class AccessportalApplication {

    public static void main(String[] args) {
        SpringApplication.run(AccessportalApplication.class, args);
    }
}
