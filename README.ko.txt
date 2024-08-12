이 Homey 앱은 다음에 연결합니다:
• NPM @gslender/gigya API를 통해 Gigya Identity Platform(SAP 소유)
• https://api.ocp.electrolux.one/appliance/api/v2의 Electrolux OCP (OneConnectedPlatform) API
• Electrolux 및 AEG 모두 지원

로그인이 성공적으로 완료되면, Homey 앱은 OCP API를 확인하여 설정된 디바이스를 파악합니다.

설정 가이드

이 Homey 앱을 사용하려면, Electrolux 또는 AEG 가전제품이 EU 데이터 센터와 설정되어 있어야 합니다. API 서비스 / 제품 범위가 해당 지역 외에서는 작동하지 않기 때문입니다. 이 앱은 영국을 위치로 설정한 iOS Mobile AEG 앱에서 테스트 되었지만, EU 전 지역에서 잘 작동할 것입니다.

1. Electrolux 또는 AEG 모바일 앱에서 비밀번호와 이메일을 설정해야 합니다(OTP가 아닌 이메일과 비밀번호로 로그아웃 후 다시 로그인하세요).
2. Homey 앱을 설치하고 이메일과 비밀번호를 사용하여 설정을 구성합니다. 이 인증 정보는 유지되지만, 앱에서 필요한 경우 재사용되고 새로 고쳐지는 JWT 클레임을 생성하는 데만 사용됩니다.
3. 앱을 사용하여 디바이스를 추가하고 해당 유형 (예: 세탁기 / 공기 청정기 등)을 선택하세요.
4. 가전 제품 / 디바이스가 사용 가능하지 않으면, https://github.com/gslender/com.gslender.electrolux-aeg.ocp/issues/new/choose에 방문하여 지원 요청을 해주세요.

감사합니다!

Rickardp의 원본 코드를 인용합니다. 이 코드는 공기 청정기 지원을 구축하는 데 사용된 요소들입니다. (https://github.com/rickardp)