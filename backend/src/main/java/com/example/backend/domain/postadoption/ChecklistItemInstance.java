package com.example.backend.domain.postadoption;

import com.example.backend.domain.postadoption.PostAdoptionStepInstance;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "checklist_item_instance")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ChecklistItemInstance {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "step_instance_id", nullable = false)
    private PostAdoptionStepInstance postAdoptionStepInstance;

    @Column(nullable = false)
    private String itemText;
    private boolean checked; // 체크 여부

    public ChecklistItemInstance(PostAdoptionStepInstance postAdoptionStepInstance, String itemText, boolean checked) {
        this.postAdoptionStepInstance = postAdoptionStepInstance;
        this.itemText = itemText;
        this.checked = checked;
    }
}
