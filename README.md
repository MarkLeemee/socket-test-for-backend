# Socket test page for backend developer

## Usage

- Start Dev server

```sh
> yarn server
```

- Start Client

```sh
> yarn clinet
```

- port 변경이 필요할 경우

  - server : `/server/app.js` 3번 라인
  - client : `package.json` script

- socket host 및 .on 로직 커스텀이 필요할 경우
  - `client/config.js` 수정
