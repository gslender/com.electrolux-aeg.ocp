이 Homey 앱은 다음에 연결됩니다
• https://api.developer.electrolux.one의 공식 Electrolux Group 개발자 API
• Electrolux 및 AEG 가전제품 모두 지원

설정 가이드

1. Electrolux 또는 AEG 모바일 앱과 동일한 계정(이메일 및 비밀번호)으로 https://developer.electrolux.one에 로그인하세요.
2. Dashboard에서 API 키를 생성한 다음 GET ACCESS TOKEN을 클릭하여 access token과 refresh token을 생성하세요.
3. Homey 앱 설정을 열고 API 키, access token, refresh token을 붙여넣으세요. 앱이 토큰을 자동으로 갱신하므로 토큰 쌍은 Homey 전용으로 사용하고 다른 앱과 공유하지 마세요.
4. 앱을 사용하여 기기를 추가하고 세탁기 / 공기청정기 등 해당 유형을 선택하세요.
5. 가전제품 / 기기를 사용할 수 없는 경우 https://github.com/gslender/com.electrolux-aeg.ocp/issues/new/choose를 방문하여 기기 지원을 요청하세요.

Electrolux 무료 개발자 플랜은 하루 5000회의 API 호출을 허용합니다. 가전제품이 많으면 이 한도 내에 머물도록 폴링 간격이 자동으로 늘어납니다.

버전 1.x에서 업그레이드: 이메일과 비밀번호 로그인은 더 이상 지원되지 않습니다. 업데이트 후 앱 설정을 열고 개발자 자격 증명을 입력하세요 - 기존 기기는 유지됩니다.

감사합니다!

공기청정기 지원 구축에 일부 요소가 사용된 https://github.com/rickardp의 원본 코드에 감사드립니다.