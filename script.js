window.addEventListener("DOMContentLoaded", init);

function init() {
  const canvas = document.getElementById("canvas1");

  const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
  const width = 800;
  const height = 500;
  renderer.setSize(width, height);

  // カメラの設定
  const fov = 75;
  const aspect = 2; // the canvas default
  const near = 0.1;
  const far = 1000;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.z = 100;

  // シーンの設定
  const scene = new THREE.Scene();

  // カメラコントロールができるようにする(オービットコントロールを作成)
  const controls = new THREE.OrbitControls(camera, canvas);
  controls.enableDamping = true; // 慣性の有効化
  controls.dampingFactor = 0.25;

  // ファイル入力要素の取得
  const fileInput = document.getElementById("fileInput");

  // ファイルが選択されたときの処理
  fileInput.addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      const fileName = file.name.toLowerCase();
      reader.onload = function (e) {
        const contents = e.target.result;
        let object = 0;
        if (fileName.endsWith(".obj")) {
          // OBJLoaderで読み込み
          const objLoader = new THREE.OBJLoader();
          object = objLoader.parse(contents);
        } else if (fileName.endsWith(".stl")) {
          console.log(fileName);
          const stlLoader = new THREE.STLLoader();
          const geometry = stlLoader.parse(contents);
          const material = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });
          object = new THREE.Mesh(geometry, material);
        } else {
          console.log("ファイルが選択されていません");
        }
        object.position.set(0, 0, 0);
        scene.add(object);
      };
      if (fileName.endsWith(".obj")) {
        reader.readAsText(file);
      } else {
        reader.readAsArrayBuffer(file);
      }
    }
  });

  // 環境光源を作成
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  // 平行光源を作成
  const directionalLight = new THREE.DirectionalLight(0xffffff);
  directionalLight.intensity = 1;
  directionalLight.position.set(1, 10, 1);
  scene.add(directionalLight);

  // 座標軸の表示
  // new THREE.AxesHelper(軸の長さ);
  const axis = new THREE.AxesHelper(500);
  scene.add(axis);

  // レイキャスターとマウス
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  // ダブルクリック時にレイキャストを実行
  canvas.addEventListener("dblclick", (event) => {
    // マウス座標を正規化
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / canvas.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / canvas.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
      const intersect = intersects[0];
      const intersectPoint = intersect.point;

      console.log("交差点の座標:", intersectPoint);

      // 取得した座標を文字列に
      const positionText = `X: ${intersectPoint.x.toFixed(
        2
      )}, Y: ${intersectPoint.y.toFixed(2)}, Z: ${intersectPoint.z.toFixed(2)}`;
      // 表示用divに反映
      document.getElementById("ray_coordinate").innerText = positionText;
      // 既存のマーカーを削除（必要なら）
      const existingMarker = scene.getObjectByName("clickMarker");
      if (existingMarker) {
        scene.remove(existingMarker);
      }

      // 交差点に小さな球体マーカーを追加
      const markerGeometry = new THREE.SphereGeometry(1.5, 16, 16);
      const markerMaterial = new THREE.MeshStandardMaterial({
        color: 0xff0000,
      });
      const marker = new THREE.Mesh(markerGeometry, markerMaterial);
      marker.position.copy(intersectPoint);
      marker.name = "clickMarker";
      scene.add(marker);
    } else {
      console.log("交差なし");
    }
  });

  // ボタンが押されたときの処理
  document.getElementById("applyButton").addEventListener("click", () => {
    const x1 = parseFloat(document.getElementById("x1").value);
    const y1 = parseFloat(document.getElementById("y1").value);
    const z1 = parseFloat(document.getElementById("z1").value);
    const x2 = parseFloat(document.getElementById("x2").value);
    const y2 = parseFloat(document.getElementById("y2").value);
    const z2 = parseFloat(document.getElementById("z2").value);
    const x3 = parseFloat(document.getElementById("x3").value);
    const y3 = parseFloat(document.getElementById("y3").value);
    const z3 = parseFloat(document.getElementById("z3").value);
    console.log(x1);
    // 三つの座標
    const p1 = new THREE.Vector3(x1, y1, z1);
    const p2 = new THREE.Vector3(x2, y2, z2);
    const p3 = new THREE.Vector3(x3, y3, z3);

    // ベクトル計算で法線を求める
    const v1 = new THREE.Vector3().subVectors(p2, p1);
    const v2 = new THREE.Vector3().subVectors(p3, p1);
    const normal = new THREE.Vector3().crossVectors(v1, v2).normalize();

    // 平面の作成（点p1を通る）
    const plane = new THREE.Plane()
      .setFromNormalAndCoplanarPoint(normal, p1)
      .normalize();

    // PlaneHelperで可視化
    const planeHelper = new THREE.PlaneHelper(plane, 100, 0xff0000); // サイズ10、色は赤
    scene.add(planeHelper);

    // クリッピングを有効化
    renderer.localClippingEnabled = true;
    renderer.clippingPlanes = [plane];
    // // モデルの位置を更新
    // if (model) {
    //   model.position.set(x, y, z);
    // }
  });

  // 画面をレンダリング(アニメーション)
  tick();

  function tick() {
    renderer.render(scene, camera);
    controls.update();
    requestAnimationFrame(tick);
  }
}
