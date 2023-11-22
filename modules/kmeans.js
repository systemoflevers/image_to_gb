
/**
 * @param {Array<any>} vectors
 * @param {number} k
 * Randomly choose `k` vectors from the 
 */
function initialRandomCentroids(vectors, k) {
  const randomVectors = new Array(k);

  const indexes = vectors.map((_, i) => i);
  for (let i = 0; i < k; ++i) {
    const randomIndex = Math.floor(Math.random() * indexes.length);
    randomVectors[i] = vectors[indexes[randomIndex]];
    indexes.splice(randomIndex, 1);
  }
  return randomVectors;
}

/**
 * Finds the euclidian distance between two vectors.
 * @param {number[]} v1 
 * @param {number[]} v2 
 * @returns 
 */
function getDistance(v1, v2) {
  let distanceSquared = 0;
  for (let i = 0; i < v1.length; ++i) {
    distanceSquared += Math.pow(v2[i] - v1[i], 2);
  }
  return Math.sqrt(distanceSquared);
}

function findNearest(vector, centroids) {
  let min = Infinity;
  let nearest = 0;

  for (let i = 0; i < centroids.length; ++i) {
    const distance = getDistance(vector, centroids[i]);
    if (distance < min) {
      min = distance;
      nearest = i;
    }
  }
  return nearest;
}

function kMeans(vectors, k, {round = false, initialCentroids = undefined}={}) {

  
  const centroids = initialCentroids?.slice() ?? initialRandomCentroids(vectors, k);
  const assignments = new Array(vectors.length);

  let cluster;

  while (true) {
    cluster = new Array(k);

    // newCentroids will first accumulate a sum of each cluster, it will then
    // be divided by the number of vectors in the cluster to get the cluster's
    // average, which will be the new centroid for that cluster.
    const newCentroids = [];
    for (let i = 0; i < k; i++) {
      newCentroids[i] = new Array(vectors[0].length).fill(0);
    }

    // group
    for (let i = 0; i < vectors.length; ++i) {
      const v = vectors[i];
      const index = findNearest(v, centroids);
      assignments[i] = index;

      if (!cluster[index]) {
        cluster[index] = [];
      }
      cluster[index].push(v);

      // add to the sum for the new centroids.
      for (let i = 0; i < v.length; ++i) {
        newCentroids[index][i] += v[i];
      }
    }

    let distance;
    let max = 0;

    for (let i = 0; i < k; ++i) {
      // maybe I should log something?
      if (!cluster[i]) continue;
      const clusterSize = cluster[i].length;
      for (let j = 0; j < newCentroids[i].length; ++j) {
        newCentroids[i][j] /= clusterSize;
      }
      const distance = getDistance(newCentroids[i], centroids[i]);
      if (distance > max) {
        max = distance;
      }
    }

    if (max <= 0.5) {
      if (round) {
        for (const c of centroids) {
          for (let i = 0; i < c.length; ++i) {
            c[i] = Math.round(c[i])
          }
        }
      }
      return [cluster, centroids, assignments];
    }

    for (let i = 0; i < newCentroids.length; ++i) {
      centroids[i] = newCentroids[i];
    }
  }
}

export {
  kMeans,
}
