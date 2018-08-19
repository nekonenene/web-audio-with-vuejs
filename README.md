# Web Audio API with Vue.js

**ここでさわれます！: [https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)**


## Require

* Node.js: v8.11.3 (v8.x LTS)
* npm: v6.4.0 or above


## 開発するには……

このリポジトリをクローンしたのち、

```
make init
```

で依存ライブラリのダウンロード。

```
make run
```

で開発用サーバーが起動し、 http://localhost:8013 にアクセス可能。


## ビルドするには……

* 本番環境用
  ```
  make build
  ```

* 開発環境用
  ```
  make build-dev
  ```


## linter

* lint チェック!!
  ```
  make lint
  ```

* lint fix!!
  ```
  make lint-fix
  ```
