package com.example.backend.repository.specification;

import com.example.backend.domain.dog.AbandonedDog;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

public class AbandonedDogSpecification {

    public static Specification<AbandonedDog> createSpecification(String region, String sexCd, String processState) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (StringUtils.hasText(region)) {
                predicates.add(criteriaBuilder.like(root.get("happenPlace"), "%" + region + "%"));
            }

            if (StringUtils.hasText(sexCd)) {
                predicates.add(criteriaBuilder.equal(root.get("sexCd"), sexCd));
            }

            if (StringUtils.hasText(processState)) {
                predicates.add(criteriaBuilder.equal(root.get("processState"), processState));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
