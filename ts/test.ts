import { Path, Query, Url } from "./Url";

const url = new Url("https://www.google.com:443/testing/fag.php");
console.log(url);
console.log(url.query.toString());
console.log(url.toString());