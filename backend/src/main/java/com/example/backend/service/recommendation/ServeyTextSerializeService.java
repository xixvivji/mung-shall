package com.example.backend.service.recommendation;

import com.example.backend.api.recommendation.dto.DogRecommendationSurveyResponse;
import com.example.backend.domain.survey.enums.*;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
public class ServeyTextSerializeService {

    public String toKoreanNormalizedText(DogRecommendationSurveyResponse survey) {
        if(survey == null) throw new IllegalArgumentException("survey must not be null");

        RestActivityLevel activity = survey.getRestActivityLevel();
        ResidenceType residence = survey.getResidenceType();
        HouseEmptyTime emptyTime = survey.getHouseEmptyTime();
        FurTolerance fur = survey.getFurTolerance();
        VisitorFrequency visitor = survey.getVisitorFrequency();

        StringBuilder sb = new StringBuilder();
        sb.append("입양자 조건(설문 기반)").append('\n');

        // (직결) 활동성
        sb.append("활동성 선호=").append(kor(activity)).append('\n');

        // (직결) 털빠짐 허용
        sb.append("털빠짐 허용=").append(kor(fur)).append('\n');

        // (메타) 주거환경
        sb.append("주거환경=").append(kor(residence)).append('\n');

        // (메타) 집 비움
        sb.append("집 비움=").append(kor(emptyTime)).append('\n');

        // (메타) 손님 방문
        sb.append("손님 방문=").append(kor(visitor)).append('\n');

        // (간접 추정 1) 주거환경 → 소음 민감도(=조용함 선호, 짖음 낮음 선호)
        sb.append(inferNoisePreference(residence)).append('\n');

        // (간접 추정 2) 집 비움 시간 → 혼자있기 필요도(분리불안 낮음 선호)
        sb.append(inferAloneNeed(emptyTime)).append('\n');

        // (간접 추정 3) 손님 방문 → 낯선사람 친화도 선호(경계심 낮음 선호)
        sb.append(inferStrangerFriendliness(visitor)).append('\n');

        return normalizeSpaces(sb.toString().trim());
    }

    private String inferNoisePreference(ResidenceType residence) {
        // B안 규칙: 공동주택일수록 소음 민감도 ↑
        if(residence == null) return "주거환경 정보가 부족하여 짖음(소음) 민감도는 정보없음";
        return switch(residence) {
            case APARTMENT, OFFICETEL ->
                    "주거환경상 소음에 민감할 수 있어 조용한 성향을 선호함(짖음 낮음 선호)";
            case VILLA ->
                    "주거환경상 소음 민감도가 다소 있을 수 있어 비교적 조용한 성향을 선호함(짖음 낮음 선호)";
            case DETACHED_HOUSE ->
                    "주거환경상 소음 제약이 비교적 적어 짖음 민감도는 보통 수준";
            case ETC ->
                    "주거환경이 기타로 확인되어 짖음(소음) 민감도는 보통 수준으로 가정";
        };
    }

    private String inferAloneNeed(HouseEmptyTime emptyTime) {
        if(emptyTime == null) return "집 비움 정보가 부족하여 혼자있기 필요도는 정보없음";
        return switch(emptyTime) {
            case RARELY ->
                    "집을 거의 비우지 않아 혼자있기 필요도는 낮음(분리불안 낮음 선호는 약함)";
            case ONE_TO_FOUR_HOURS ->
                    "집을 1~4시간 비우므로 혼자있기 필요도는 보통(분리불안 낮음 선호)";
            case FOUR_TO_EIGHT_HOURS ->
                    "집을 4~8시간 비우므로 혼자 잘 있는 성향이 필요함(분리불안 낮음 선호)";
            case EIGHT_TO_TWELVE_HOURS ->
                    "집을 8~12시간 비우므로 혼자 잘 있는 성향이 매우 필요함(분리불안 낮음 강하게 선호)";
            case MORE_THAN_TWELVE_HOURS ->
                    "집을 12시간 이상 비우므로 혼자있기 적응이 매우 좋은 성향이 필요함(분리불안 낮음 강하게 선호)";
        };
    }

    private String inferStrangerFriendliness(VisitorFrequency visitor) {
        if(visitor == null) return "손님 방문 정보가 부족하여 낯선사람 친화도 선호는 정보없음";
        return switch(visitor) {
            case RARELY ->
                    "손님 방문이 드물어 낯선사람 친화도 선호는 보통 수준";
            case OCCASIONALLY ->
                    "손님 방문이 가끔 있어 낯선사람 친화적이면 좋음(경계심 낮음 선호)";
            case FREQUENTLY ->
                    "손님 방문이 잦아 낯선사람에게 친화적이면 좋음(경계심 낮음 선호가 큼)";
            case VERY_FREQUENTLY ->
                    "손님 방문이 매우 잦아 낯선사람에게 매우 친화적인 성향을 선호함(경계심 낮음 강하게 선호)";
        };
    }

    // ----- enum → 한글 라벨 -----

    private String kor(RestActivityLevel v) {
        if(v == null) return "정보없음";
        return switch(v) {
            case VERY_ACTIVE -> "매우 활동적";
            case ACTIVE -> "활동적";
            case MODERATE -> "보통";
            case CALM -> "차분함";
            case VERY_CALM -> "매우 차분함";
        };
    }

    private String kor(ResidenceType v) {
        if(v == null) return "정보없음";
        return switch(v) {
            case APARTMENT -> "아파트";
            case DETACHED_HOUSE -> "단독주택";
            case VILLA -> "빌라/연립";
            case OFFICETEL -> "오피스텔";
            case ETC -> "기타";
        };
    }

    private String kor(HouseEmptyTime v) {
        if(v == null) return "정보없음";
        return switch(v) {
            case RARELY -> "거의 없음(1시간 미만)";
            case ONE_TO_FOUR_HOURS -> "1~4시간";
            case FOUR_TO_EIGHT_HOURS -> "4~8시간";
            case EIGHT_TO_TWELVE_HOURS -> "8~12시간";
            case MORE_THAN_TWELVE_HOURS -> "12시간 이상";
        };
    }

    private String kor(FurTolerance v) {
        if(v == null) return "정보없음";
        return switch(v) {
            case NOT_AT_ALL -> "전혀 못 감수";
            case LOW -> "낮음";
            case MEDIUM -> "보통";
            case HIGH -> "높음";
        };
    }

    private String kor(VisitorFrequency v) {
        if(v == null) return "정보없음";
        return switch(v) {
            case RARELY -> "거의 없음";
            case OCCASIONALLY -> "가끔";
            case FREQUENTLY -> "자주";
            case VERY_FREQUENTLY -> "매우 자주";
        };
    }

    private String normalizeSpaces(String s) {
        if(!StringUtils.hasText(s)) return "";
        return s.trim().replaceAll("\\s+", " ");
    }

}
