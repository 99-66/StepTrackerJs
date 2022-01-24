/*** CONST VARIABLES ***/
const OPEN_TIME = 'p_open_time';

/*** 기본 페이지 트래킹 정보 설정 ***/
function set_page_data() {
    // 현재 페이지 이름
    let page_name = window.location.href;

    // 현재 페이지 출처: referer
    let page_source = document.referrer;
    if (page_source === "") {
        // referer가 비어있는 이유가 '페이지 뒤로가기'라면 페이지 출처를 변경한다
        const nav_type = String(window.performance.getEntriesByType("navigation")[0].type);
        if (nav_type === "back_forward") {
            page_source = nav_type;
        } else {
            // '페이지 뒤로가기' 도 아니라면 empty로 출처를 변경한다
            page_source = "empty";
        }
    }

    // 브라우저 화면 크기
    const screen_width = window.screen.width;
    const screen_height = window.screen.height;

    // 현재 시간(전송 시간)을 타임스탬프로 생성
    const timestamp = new Date().getTime();

    return JSON.stringify({
        "page_name": page_name,
        "page_source": page_source,
        "screen_width": screen_width,
        "screen_height": screen_height,
        "timestamp": timestamp
    });
}

/*** 최초 접속 시간이 설정되어 있지 않다면 설정하고, 그렇지 않다면 값을 반환한다 ***/
function page_open_time() {
    // 쿠키에 접속 시간이 없다면, 현재 타임스탬프를 기록한 후에 반환한다
    if (!getCookie(OPEN_TIME)) {
        document.cookie = OPEN_TIME + '=' + new Date().getTime();
    }

    return getCookie(OPEN_TIME);
}

/*** 쿠키에서 값을 가져오는 함수 ***/
function getCookie(name) {
    name = name + '=';
    let decodedCookie = decodeURIComponent(document.cookie);
    let cookies = decodedCookie.split(';');

    for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i].trim();

        if (cookie.indexOf(name) === 0) {
            return cookie.substring(name.length, cookie.length);
        }
    }

    return false
}


/*** 페이지 트래킹/방문 정보를 전송한다 ***/
function post_data(data, url) {
    if (data === undefined || data === "") {
        data = set_page_data()
    }
    if (url === undefined || url === "") {
        url = 'http://localhost:8000/a'
    }
    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    // Api 서버없이 트래킹 로그를 확인하기 위한 콘솔 로깅
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            console.log(xhr.response);
        }
    };
    xhr.send(data);
}


/*** 사이트 방문 종료 시, 방문/종료시간을 전송하는 함수 ***/
function ByeSite() {
    // 접속 시간을 쿠키에서 가져온다
    const p_open_time = page_open_time();

    // 종료 시간을 타임스탬프로 생성
    const p_close_time = new Date().getTime();
    // 현재 시간(전송 시간)을 타임스탬프로 생성
    const timestamp = new Date().getTime();
    const data = JSON.stringify({
        "page_open": p_open_time,
        "page_close": p_close_time,
        "timestamp": timestamp
    })
    post_data(data);
}
/*** unload(사이트 방문 종료)시에 사용 시간을 전송하는 이벤트를 등록한다 ***/
window.addEventListener("beforeunload", ByeSite);

/*** 페이지별로 로딩이 완료되면, 트래킹/방문 정보를 전송한다 ***/
window.onload = function() {
    // 최초 방문 시, 접속 시간을 쿠키에 기록한다
    page_open_time();

    // 페이지 로딩이 완료되면 트래킹 정보를 전송한다
    post_data();
}
