<script>
  export let data;

  let dateOptions = {
    weekday: "long",
    year: "numeric",
    month: "2-digit",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  };

  function getData(data = {}) {
    let entries,
      pairs,
      item,
      ret = [];
    if (typeof data != "object") return ret;

    ret = Object.entries(data).map(([key, value]) => ({ [key]: value }));
    return ret;
  }
</script>

<div class="wrapper">
  <ul>
    <li>id:{data.id}</li>
    <li>image_id:{data.image_id}</li>
    <li>title:{data.title}</li>
    <li>description:{data.description}</li>
    <li>sequence:{data.sequence}</li>
    <li>
      modified: {new Date(data.modified).toLocaleDateString(
        "de-DE",
        dateOptions
      )}
    </li>
    <li>
      created: {new Date(data.created).toLocaleDateString("de-DE", dateOptions)}
    </li>
    <li>src:{data.src}</li>
  </ul>
</div>
