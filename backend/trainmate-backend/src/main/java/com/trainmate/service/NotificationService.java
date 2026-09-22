package com.trainmate.service;

import com.trainmate.dto.NotificationResponse;
import com.trainmate.entity.Cohort;
import com.trainmate.entity.Notification;
import com.trainmate.entity.Role;
import com.trainmate.entity.Trainer;
import com.trainmate.entity.User;
import com.trainmate.repository.NotificationRepository;
import com.trainmate.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(NotificationRepository notificationRepository, UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public void sendMail(Cohort cohort, User receiver, String type, String message) {
        if (receiver == null) return;
        Notification notif = new Notification(cohort, receiver, type, message);
        notificationRepository.save(notif);
    }

    @Transactional
    public void notifyTrainerAssigned(Cohort cohort, Trainer trainer) {
        // Mail to Trainer
        sendMail(
                cohort,
                trainer.getUser(),
                "COHORT_ASSIGNMENT",
                "You have been assigned to lead cohort " + cohort.getCohortCode() + " (" + cohort.getRequiredSkill() + ")."
        );

        // Mail to Coach
        sendMail(
                cohort,
                cohort.getCoachUser(),
                "TRAINER_ASSIGNED",
                trainer.getUser().getName() + " has been assigned to your cohort " + cohort.getCohortCode() + "."
        );
    }

    @Transactional
    public void notifyAllocationFailed(Cohort cohort) {
        // Alert to Coach
        sendMail(
                cohort,
                cohort.getCoachUser(),
                "ALLOCATION_PENDING",
                "No eligible trainer was found for cohort " + cohort.getCohortCode() + ". Status set to UNASSIGNED."
        );

        // Alert to Admins
        List<User> admins = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.ADMIN)
                .collect(Collectors.toList());

        for (User admin : admins) {
            sendMail(
                    cohort,
                    admin,
                    "UNASSIGNED_ALERT",
                    "Cohort " + cohort.getCohortCode() + " requires manual trainer assignment."
            );
        }
    }

    @Transactional
    public void notifyReassigned(Cohort cohort, Trainer oldTrainer, Trainer newTrainer, String reason) {
        // Mail to new trainer
        sendMail(
                cohort,
                newTrainer.getUser(),
                "COHORT_ASSIGNMENT",
                "You have been assigned to cohort " + cohort.getCohortCode() + " by Admin override."
        );

        // Mail to previous trainer (if any)
        if (oldTrainer != null) {
            sendMail(
                    cohort,
                    oldTrainer.getUser(),
                    "TRAINER_REPLACED",
                    "You have been unassigned from cohort " + cohort.getCohortCode() + "."
            );
        }

        // Mail to Coach
        sendMail(
                cohort,
                cohort.getCoachUser(),
                "TRAINER_REASSIGNED",
                "Trainer for cohort " + cohort.getCohortCode() + " was changed to " + newTrainer.getUser().getName() + ". Reason: " + (reason != null ? reason : "Administrative override")
        );
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> getNotifications(Long userId) {
        List<Notification> notifs = notificationRepository.findByReceiverUserIdOrderByCreatedDateDesc(userId);
        return notifs.stream().map(n -> new NotificationResponse(
                n.getId(),
                n.getReceiverUser().getId(),
                n.getReceiverUser().getRole().name(),
                n.getNotificationType(),
                n.getMessage(),
                n.getIsRead(),
                n.getCreatedDate()
        )).collect(Collectors.toList());
    }

    @Transactional
    public int markAllAsRead(Long userId) {
        return notificationRepository.markAllAsReadByUserId(userId);
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(Long userId) {
        return notificationRepository.findByReceiverUserIdAndIsReadFalse(userId).size();
    }
}
