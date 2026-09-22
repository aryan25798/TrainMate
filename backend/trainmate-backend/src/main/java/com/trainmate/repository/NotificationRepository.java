package com.trainmate.repository;

import com.trainmate.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByReceiverUserIdOrderByCreatedDateDesc(Long receiverUserId);
    long countByReceiverUserId(Long receiverUserId);
    List<Notification> findByCohort(com.trainmate.entity.Cohort cohort);
    void deleteByCohort(com.trainmate.entity.Cohort cohort);
}
