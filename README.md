# douga-mokuji
動画の目次を作り、時間毎の映像を視聴するためのアプリ
https://arcane-depths-59921.herokuapp.com/posts

![e8fb6ee6edf3ba1307c473964066325d.png](https://user-images.githubusercontent.com/58941860/106844903-17f2c300-66ed-11eb-92dd-e31c000ec605.png)


**ユーザー名、パスワードは以下です。**

- guest1のアカウント
ユーザー名：guest1
パスワード：1234

- guest2のアカウント
ユーザー名：guest2
パスワード：5678

# 使用方法
niconicoのURLと、説明文に時間とその映像の内容を投稿します。
お手数ですが、説明文の指定時間をもとに手動で指定してください。

# 製作背景
動画のシーン毎を設定して、リスナー側が目的の映像をすぐ探せるために作りました。
長時間の動画であっても目的の部分までスキップしてみることができるようにしました。
手動で探すことになりますので、いつか自動でできる機能を追加していくのが今後の課題かもしれません。

# 技術
- Languages : HTML / JavaScript
- Framework : Node.js 10.14.2
- Tool, Package : Pug / PostgreSQL 12.3 / Bootstrap 4.0.0

# 環境構築

```
$ mkdir hoge
$ cd hoge
$ git clone git@github.com:yuichisan171/douga-mokuji.git
$ cd douga-mokuji
$ yarn install
```

テストはassertを使用。

```
$ node test.js
```