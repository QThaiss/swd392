package com.lessonplanexam.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendOtpEmail(String toEmail, String otpCode) {
        // Log OTP to console for manual verification support
        System.out.println("==================================================");
        System.out.println("MANUAL VERIFICATION OTP FOR: " + toEmail);
        System.out.println("OTP CODE: " + otpCode);
        System.out.println("==================================================");

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Your OTP Verification Code");

            String htmlContent = String.format(
                    "<html><body>" +
                            "<h2>Verify Your Account</h2>" +
                            "<p>Hello,</p>" +
                            "<p>Your One-Time Password (OTP) for registration is:</p>" +
                            "<h1 style='color: #4F46E5; letter-spacing: 5px;'>%s</h1>" +
                            "<p>This code will expire in 10 minutes.</p>" +
                            "<p>If you did not request this, please ignore this email.</p>" +
                            "</body></html>",
                    otpCode);

            helper.setText(htmlContent, true);
            mailSender.send(message);
            log.info("OTP email sent to {}", toEmail);

        } catch (Exception e) {
            log.error("Failed to send OTP email to {}: {}", toEmail, e.getMessage());
            // Do NOT throw exception here. Allow registration to complete even if email
            // fails.
        }
    }
}
