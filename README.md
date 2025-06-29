## 프로젝트 명
React + Nodejs + MongoDB 를 활용한 웹 사이트 구현
</p>

## 개발목표
- 회원 기능 및 관리자 설계
- 게시판 및 다중 게시판 확장 가능 구조 설계
- 데이터베이스 변경 이력 추적을 위한 일자(생성, 수정, 삭제)  관리

## 주요 기능

<pre lang="markdown">
1. 유저
 
● 로그인 : JWT 토큰과 쿠키 기반 인증 처리
● 로그아웃 : 쿠키 삭제를 통한 세션 종료
● 회원가입 : 아이디, 이메일, 닉네임 중복 확인 기능 포함
● 회원탈퇴 : useyn 필드로 논리 삭제, 유니크 컬럼은 delete_ 접두사로 변경
● 비밀번호 변경 : (1)로그인 상태 (2)이메일 전송을 통한 비밀번호 찾기 기능
● 암호화 : bcrypt 라이브러리 활용
● 프로필 조회 및 변경 : JWT 토큰으로 본인 확인 후, 정보 조회 및 수정

2. 다중게시판
 
● 게시판 : CRUD 구현 (관리자 메뉴 UI 구현)
● 게시물 : CRUD 구현
● 댓글 : CRUD 구현
● 공통
  - Create : 복합키 자동 인덱싱 구현
  - Read   : 페이징 및 단일조회 구현
  - Update : 작성자 및 관리자 권한여부 구현
  - Delete : useyn 필드 기반 논리 삭제
  - 회원탈퇴일 경우, 탈퇴한 사용자 표기
  - 해상도 크기 비교후, 모바일/PC UI 표기
</pre>

## ERD
![GXLhjo3jZ4Mr4fjrd](https://github.com/user-attachments/assets/059c24ea-e218-4a7c-bd84-ecc8d54a231f)

## API

<pre lang="markdown">
/*
  [POST] /api/v1/comment/create
  - 댓글 작성

  1. Input
    - Params : {boardType : String, postindex : Integer, commentIndex : Integer, content : String }
    - Cookie : authToken

  2. Output
     a. Success
        - status 200 { success : true, msg : '댓글작성 성공' }
     b. Fail
        - status 400 { success : false, msg : '필수 파라미터 누락' }  
        - status 401 { success : false, msg : '사용자를 찾을 수 없습니다.' }                
        - status 500 { success : false, msg : '서버 오류' }
*/
</pre>

각 엔드포인트 별, 주석을 작성하여 표기

## 결과
<p style="display: flex; gap: 10px;">
  <img src="https://github.com/user-attachments/assets/43a2f59a-9a7b-4b03-aae5-d8ce23ddc15d" style="width: 300px; height: 200px; object-fit: cover;" />
  <img src="https://github.com/user-attachments/assets/5b87bce9-a8a2-4647-960d-cc88183dc676" style="width: 300px; height: 200px; object-fit: cover;" />
</p>
<p style="display: flex; gap: 10px;">
  <img src="https://github.com/user-attachments/assets/79d0c235-7be4-4fb7-86da-12ebae191d31" style="width: 300px; height: 200px; object-fit: cover;" />
  <img src="https://github.com/user-attachments/assets/ca273f01-b709-4a1b-a1b0-046449b1bb7d" style="width: 300px; height: 200px; object-fit: cover;" />
</p>
<p style="display: flex; gap: 10px;">
  <img src="https://github.com/user-attachments/assets/6d375a88-ade3-4842-902e-38636a9912b5" style="width: 300px; height: 200px; object-fit: cover;" />
  <img src="https://github.com/user-attachments/assets/b69e22eb-2600-450e-a987-ac5820105855" style="width: 300px; height: 200px; object-fit: cover;" />
</p>

