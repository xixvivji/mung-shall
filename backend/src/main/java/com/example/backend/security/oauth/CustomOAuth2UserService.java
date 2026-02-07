package com.example.backend.security.oauth;

import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        String registrationId = userRequest.getClientRegistration().getRegistrationId(); // google/kakao/naver
        Map<String, Object> attributes = oAuth2User.getAttributes();

        OAuth2UserInfo userInfo = OAuth2UserInfoExtractor.extract(registrationId, attributes);

        Map<String, Object> mapped = new HashMap<>(attributes);
        mapped.put("provider", registrationId);
        mapped.put("providerUserId", userInfo.getProviderUserId());
        mapped.put("email", userInfo.getEmail());

        String nameAttrKey = "email";
        if (mapped.get(nameAttrKey) == null) {
            mapped.put(nameAttrKey, userInfo.getProviderUserId());
        }

        return new DefaultOAuth2User(oAuth2User.getAuthorities(), mapped, nameAttrKey);
    }

    public static class OAuth2UserInfo {
        private final String providerUserId;
        private final String email;

        public OAuth2UserInfo(String providerUserId, String email) {
            this.providerUserId = providerUserId;
            this.email = email;
        }
        public String getProviderUserId() { return providerUserId; }
        public String getEmail() { return email; }
    }

    // provider별 attribute 파싱
    static class OAuth2UserInfoExtractor {
        static OAuth2UserInfo extract(String provider, Map<String, Object> attributes) {
            switch (provider) {
                case "google" -> {
                    String sub = (String) attributes.get("sub");
                    String email = (String) attributes.get("email");
                    return new OAuth2UserInfo(sub, email);
                }
                case "kakao" -> {
                    // kakao: id, kakao_account.email
                    Object idObj = attributes.get("id");
                    String id = (idObj == null) ? null : String.valueOf(idObj);

                    String email = null;
                    Object kakaoAccount = attributes.get("kakao_account");
                    if (kakaoAccount instanceof Map<?, ?> map) {
                        Object emailObj = map.get("email");
                        if (emailObj != null) email = String.valueOf(emailObj);
                    }
                    return new OAuth2UserInfo(id, email);
                }
                case "naver" -> {
                    // naver: response.id, response.email
                    Object response = attributes.get("response");
                    if (response instanceof Map<?, ?> map) {
                        String id = map.get("id") == null ? null : String.valueOf(map.get("id"));
                        String email = map.get("email") == null ? null : String.valueOf(map.get("email"));
                        return new OAuth2UserInfo(id, email);
                    }
                    return new OAuth2UserInfo(null, null);
                }
                default -> throw new IllegalArgumentException("Unsupported provider: " + provider);
            }
        }
    }
}
