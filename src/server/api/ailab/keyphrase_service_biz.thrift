namespace py lab_api.python.keyphrase_service.biz

enum RequestType {
    GID = 1,        # gid
    TEXT = 2        # title & content
}

struct Phrase {
    1: string text, # utf-8
    2: double score
}

struct KeyphraseRequest {
    1: required RequestType req_type,
    2: required string caller,
    3: optional i64 gid,
    4: optional string title, # utf-8
    5: optional string content, # utf-8
    6: optional i64 count = 5,
}

struct KeyphraseResponse {
    1: required i64 status,
    2: optional list<Phrase> keyphrases,
    3: optional string err_msg
}

service KeyphraseService {
  KeyphraseResponse extract(1:KeyphraseRequest req)
}
