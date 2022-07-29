import { PlainArticle } from "../../../model/model";

const pharseMarkdown = (file: string) => {
  var handlingBody = false;
  const fileRawArray: Array<string> = file.split("\n");
  var res: PlainArticle = new PlainArticle();
  res["body"] = [];

  for (const element of fileRawArray) {
    if (handlingBody){
      if (element == ""){
        continue
      }else if (element.slice(0, 3) == "###"){
        var content = element.slice(4, element.length + 1)
        res["body"].push({"h3": content})
      }else if (element.slice(0, 2) == "##"){
        var content = element.slice(3, element.length + 1)
        res["body"].push({"h2": content})
      }else if (element.slice(0, 1) == "#"){
        var content = element.slice(2, element.length + 1)
        res["body"].push({"h1": content})
      }else{
        var content = element.slice(0, element.length + 1)
        res["body"].push({"p": content})
      }
    }else{
      if (element == ""){
        continue
      }else if (element.slice(0, 2) == "##"){
        var content = element.slice(3, element.length + 1)
        res["subtitle"] = content;
      }else if (element.slice(0, 1) == "#"){
        var content = element.slice(2, element.length + 1)
        res["title"] = content;
      }else if (element.slice(0, 3) == "---") {
        handlingBody = true
        continue;
      }else if (element.slice(0, 7) == "- type:"){
        res["type"] = element.slice(8, element.length + 1)
      }else if (element.slice(0, 17) == "- firstPublished:"){
        res["firstPublished"] = +element.slice(18, element.length + 1)
      }else if (element.slice(0, 7) == "- tags:"){
        var tagString = element.slice(8, element.length + 1)
        var tagList = tagString.split(",").map(item => item.trim())
        res["tags"] = tagList
      }else if (element.slice(0, 9) == "- series:"){
        res["series"] = element.slice(10, element.length + 1)
      }
    }
  }
  return res;
}

export default pharseMarkdown;

